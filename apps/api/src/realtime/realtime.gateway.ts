import type { IncomingMessage } from 'node:http'
import { ForbiddenException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { WebSocketGateway, type GatewayMetadata } from '@nestjs/websockets'
import { decoding, encoding } from 'lib0'
import { REALTIME_FRAME } from '@syncspace/contracts'
import { eq } from 'drizzle-orm'
import { applyAwarenessUpdate } from 'y-protocols/awareness'
import * as Y from 'yjs'
import WebSocket, { type RawData } from 'ws'
import { ACCESS_COOKIE } from '../auth/auth.cookies'
import { SessionService } from '../auth/session.service'
import { DatabaseService } from '../database/database.service'
import { users } from '../database/schema'
import { DocumentsService } from '../documents/documents.service'
import { PresenceService, type RealtimeIdentity } from './presence/presence.service'
import { RealtimeService, type RealtimeRoom } from './realtime.service'

const MAX_REALTIME_PAYLOAD_BYTES = 256 * 1024
const MAX_MESSAGES_PER_MINUTE = 1_200
const UUID_PATTERN = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i

interface AccessTokenPayload {
  sub: string
  sid: string
}

interface ConnectionState {
  identity?: RealtimeIdentity & { sessionId: string }
  authPromise: Promise<RealtimeIdentity & { sessionId: string }>
  messageQueue: Promise<void>
  room?: RealtimeRoom
  documentId?: string
  awarenessClientId?: number
  messageWindowStartedAt: number
  messageCount: number
  closed: boolean
}

@WebSocketGateway({
  path: '/realtime',
  maxPayload: MAX_REALTIME_PAYLOAD_BYTES,
  perMessageDeflate: false,
} as GatewayMetadata)
export class RealtimeGateway {
  private readonly logger = new Logger(RealtimeGateway.name)
  private readonly connections = new WeakMap<WebSocket, ConnectionState>()
  private readonly frontendOrigin: string

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly sessions: SessionService,
    private readonly database: DatabaseService,
    private readonly documents: DocumentsService,
    private readonly realtime: RealtimeService,
    private readonly presence: PresenceService,
  ) {
    this.frontendOrigin = new URL(config.get<string>('FRONTEND_URL', 'http://localhost:3000')).origin
  }

  handleConnection(socket: WebSocket, request: IncomingMessage): void {
    const origin = request.headers.origin
    const isProductionProxy = !origin && this.config.get<string>('NODE_ENV') === 'production'
    if ((origin && origin !== this.frontendOrigin) || (!origin && !isProductionProxy)) {
      socket.close(4403, 'Origin not allowed.')
      return
    }

    const state: ConnectionState = {
      authPromise: this.authenticate(request),
      messageQueue: Promise.resolve(),
      messageWindowStartedAt: Date.now(),
      messageCount: 0,
      closed: false,
    }
    this.connections.set(socket, state)

    void state.authPromise.then((identity) => {
      state.identity = identity
      if (socket.readyState === WebSocket.OPEN) this.sendJson(socket, 'connection:ready', {})
    }).catch(() => {
      this.sendJson(socket, 'collaboration:error', { message: 'Authentication required.' })
      socket.close(4401, 'Authentication required.')
    })

    socket.on('message', (data, isBinary) => {
      state.messageQueue = state.messageQueue.then(async () => {
        const identity = await state.authPromise
        state.identity = identity
        if (state.closed || socket.readyState !== WebSocket.OPEN) return
        await this.consumeMessage(socket, state, identity, data, isBinary)
      }).catch((error: unknown) => {
        if (state.closed) return
        if (error instanceof ForbiddenException) {
          this.fail(socket, state, 4403, 'You no longer have permission to access this document.')
          return
        }
        if (error instanceof UnauthorizedException) {
          this.fail(socket, state, 4401, 'Your session is no longer active.')
          return
        }
        if (error instanceof NotFoundException) {
          this.fail(socket, state, 4404, 'Document access was not found.')
          return
        }
        this.logger.warn(`Realtime message rejected for document ${state.documentId ?? 'unjoined'}.`)
        this.fail(socket, state, 4400, 'The collaboration message could not be processed.')
      })
    })

    socket.on('close', () => void this.cleanup(socket, state))
    socket.on('error', () => this.logger.warn('Realtime socket closed after a transport error.'))
  }

  handleDisconnect(socket: WebSocket): void {
    const state = this.connections.get(socket)
    if (state) void this.cleanup(socket, state)
  }

  private async authenticate(request: IncomingMessage): Promise<RealtimeIdentity & { sessionId: string }> {
    const token = this.readCookie(request.headers.cookie, ACCESS_COOKIE)
    if (!token) throw new UnauthorizedException()

    let payload: AccessTokenPayload
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token)
    } catch {
      throw new UnauthorizedException()
    }

    if (!payload.sub || !payload.sid || !(await this.sessions.isActive(payload.sid, payload.sub))) {
      throw new UnauthorizedException()
    }

    const [user] = await this.database.db
      .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1)

    if (!user) throw new UnauthorizedException()
    return {
      ...user,
      color: this.presence.colorForUser(user.id),
      sessionId: payload.sid,
    }
  }

  private async consumeMessage(
    socket: WebSocket,
    state: ConnectionState,
    identity: RealtimeIdentity & { sessionId: string },
    data: RawData,
    isBinary: boolean,
  ): Promise<void> {
    if (!this.allowMessage(state)) {
      this.fail(socket, state, 4429, 'Realtime message rate limit exceeded.')
      return
    }

    if (isBinary) {
      await this.consumeBinary(socket, state, identity, this.toUint8Array(data))
      return
    }

    const text = this.toUint8Array(data).toString('utf8')
    if (text.length > 4_096) throw new ForbiddenException()

    let message: { event?: unknown; data?: unknown }
    try {
      message = JSON.parse(text) as { event?: unknown; data?: unknown }
    } catch {
      throw new ForbiddenException()
    }

    const payload = message.data && typeof message.data === 'object' && !Array.isArray(message.data)
      ? message.data as Record<string, unknown>
      : {}

    if (message.event === 'document:join') {
      await this.joinDocument(socket, state, identity, payload)
      return
    }

    if (message.event === 'document:leave') {
      await this.leaveDocument(socket, state)
      return
    }

    if (message.event === 'document:sync-complete' && state.room && state.documentId) {
      await this.authorizeDocument(state, false)
      this.realtime.touch(state.documentId, socket)
      this.sendBinary(socket, REALTIME_FRAME.serverStateVector, Y.encodeStateVector(state.room.document))
      this.sendJson(socket, 'document:synced', { documentId: state.documentId })
      return
    }

    throw new ForbiddenException()
  }

  private async joinDocument(
    socket: WebSocket,
    state: ConnectionState,
    identity: RealtimeIdentity & { sessionId: string },
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (state.room) {
      if (state.documentId === payload.documentId) return
      await this.leaveDocument(socket, state)
    }

    const documentId = typeof payload.documentId === 'string' ? payload.documentId : ''
    const clientId = payload.clientId
    if (!UUID_PATTERN.test(documentId) || typeof clientId !== 'number' || !Number.isSafeInteger(clientId) || clientId < 0) {
      throw new ForbiddenException()
    }

    const access = await this.authorizeDocument(state, false, documentId)
    const { room, user, users: collaborators } = await this.realtime.join(access.document, socket, identity)
    if (clientId === room.awareness.clientID || room.awarenessOwners.has(clientId)) {
      await this.realtime.leave(room, socket)
      throw new ForbiddenException()
    }

    room.awarenessOwners.set(clientId, socket)
    state.room = room
    state.documentId = documentId
    state.awarenessClientId = clientId
    this.realtime.touch(documentId, socket)
    if (!(await this.realtime.ensureSocketAccess(room, socket))) return

    this.sendJson(socket, 'document:ready', {
      documentId,
      canEdit: access.canEdit,
      user,
      collaborators,
    })
    this.sendBinary(socket, REALTIME_FRAME.serverStateVector, Y.encodeStateVector(room.document))
    const awareness = this.realtime.getAwarenessUpdate(room)
    if (awareness) this.sendBinary(socket, REALTIME_FRAME.serverAwareness, awareness)
    await this.sendJsonToRoom(room, socket, 'presence:update', { collaborators: this.realtime.listPresence(documentId) })
  }

  private async consumeBinary(
    socket: WebSocket,
    state: ConnectionState,
    identity: RealtimeIdentity & { sessionId: string },
    frame: Buffer,
  ): Promise<void> {
    if (frame.byteLength < 2 || !state.room || !state.documentId) throw new ForbiddenException()
    const type = frame[0]
    const payload = frame.subarray(1)
    const room = state.room

    if (type === REALTIME_FRAME.clientStateVector) {
      await this.authorizeDocument(state, false)
      this.realtime.touch(state.documentId, socket)
      Y.decodeStateVector(payload)
      this.sendBinary(socket, REALTIME_FRAME.serverSyncUpdate, Y.encodeStateAsUpdate(room.document, payload))
      return
    }

    if (type === REALTIME_FRAME.clientUpdate) {
      const access = await this.authorizeDocument(state, true)
      if (!access.canEdit || payload.byteLength <= 16) throw new ForbiddenException()
      const updateId = this.formatUuid(payload.subarray(0, 16))
      const update = payload.subarray(16)
      const inserted = await this.realtime.persistUpdate(room, socket, identity.id, update)
      this.realtime.touch(state.documentId, socket)
      this.sendJson(socket, 'document:ack', { updateId, durable: true })
      if (inserted) await this.broadcastBinary(room, socket, REALTIME_FRAME.serverUpdate, update)
      return
    }

    if (type === REALTIME_FRAME.clientAwareness) {
      await this.authorizeDocument(state, false)
      const sanitized = this.sanitizeAwarenessUpdate(room, socket, identity, state.awarenessClientId, payload)
      if (sanitized) {
        applyAwarenessUpdate(room.awareness, sanitized, socket)
        this.realtime.touch(state.documentId, socket)
      }
      return
    }

    throw new ForbiddenException()
  }

  private async authorizeDocument(
    state: ConnectionState,
    needsEdit: boolean,
    requestedDocumentId?: string,
  ) {
    const identity = state.identity
    const documentId = requestedDocumentId ?? state.documentId
    if (!identity || !documentId) throw new UnauthorizedException()
    if (!(await this.sessions.isActive(identity.sessionId, identity.id))) throw new UnauthorizedException()

    const access = await this.documents.getAccess(documentId, identity.id)
    if (!access.canRead || (needsEdit && !access.canEdit)) throw new ForbiddenException()
    return access
  }

  private sanitizeAwarenessUpdate(
    room: RealtimeRoom,
    socket: WebSocket,
    identity: RealtimeIdentity,
    allowedClientId: number | undefined,
    update: Uint8Array,
  ): Uint8Array | null {
    if (allowedClientId === undefined) return null

    const decoder = decoding.createDecoder(update)
    const encoded = encoding.createEncoder()
    const length = decoding.readVarUint(decoder)
    const entries: Array<{ clientId: number; clock: number; state: unknown }> = []

    for (let index = 0; index < length; index += 1) {
      const clientId = decoding.readVarUint(decoder)
      const clock = decoding.readVarUint(decoder)
      const state = JSON.parse(decoding.readVarString(decoder)) as unknown
      if (clientId !== allowedClientId || room.awarenessOwners.get(clientId) !== socket) continue

      const sanitizedState = state === null
        ? null
        : {
            ...(typeof state === 'object' && state !== null && !Array.isArray(state) ? state : {}),
            user: { id: identity.id, name: identity.name, avatarUrl: identity.avatarUrl, color: identity.color },
          }
      entries.push({ clientId, clock, state: sanitizedState })
    }

    if (!entries.length) return null
    encoding.writeVarUint(encoded, entries.length)
    for (const entry of entries) {
      encoding.writeVarUint(encoded, entry.clientId)
      encoding.writeVarUint(encoded, entry.clock)
      encoding.writeVarString(encoded, JSON.stringify(entry.state))
    }
    return encoding.toUint8Array(encoded)
  }

  private async leaveDocument(socket: WebSocket, state: ConnectionState): Promise<void> {
    const room = state.room
    const documentId = state.documentId
    state.room = undefined
    state.documentId = undefined
    state.awarenessClientId = undefined
    if (!room || !documentId) return

    const collaborators = await this.realtime.leave(room, socket)
    await this.sendJsonToRoom(room, socket, 'presence:update', { collaborators })
  }

  private async cleanup(socket: WebSocket, state: ConnectionState): Promise<void> {
    if (state.closed) return
    state.closed = true
    if (state.room) await this.leaveDocument(socket, state)
  }

  private fail(socket: WebSocket, state: ConnectionState, code: number, message: string): void {
    if (state.closed) return
    state.closed = true
    this.sendJson(socket, 'collaboration:error', { message })
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close(code, message)
    }
    if (state.room) void this.leaveDocument(socket, state)
  }

  private sendJson(socket: WebSocket, event: string, data: Record<string, unknown>): void {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ event, data }))
  }

  private async sendJsonToRoom(room: RealtimeRoom, except: WebSocket, event: string, data: Record<string, unknown>): Promise<void> {
    const payload = JSON.stringify({ event, data })
    await Promise.all([...room.clients.keys()].map(async (socket) => {
      if (socket === except || socket.readyState !== WebSocket.OPEN) return
      if (await this.realtime.ensureSocketAccess(room, socket)) socket.send(payload)
    }))
  }

  private sendBinary(socket: WebSocket, type: number, payload: Uint8Array): void {
    if (socket.readyState !== WebSocket.OPEN) return
    const frame = Buffer.allocUnsafe(payload.byteLength + 1)
    frame[0] = type
    frame.set(payload, 1)
    socket.send(frame)
  }

  private async broadcastBinary(room: RealtimeRoom, except: WebSocket, type: number, payload: Uint8Array): Promise<void> {
    const frame = Buffer.allocUnsafe(payload.byteLength + 1)
    frame[0] = type
    frame.set(payload, 1)
    await Promise.all([...room.clients.keys()].map(async (socket) => {
      if (socket === except || socket.readyState !== WebSocket.OPEN) return
      if (await this.realtime.ensureSocketAccess(room, socket)) socket.send(frame)
    }))
  }

  private toUint8Array(data: RawData): Buffer {
    if (Buffer.isBuffer(data)) return data
    if (Array.isArray(data)) return Buffer.concat(data)
    if (data instanceof ArrayBuffer) return Buffer.from(data)
    const view = data as ArrayBufferView
    return Buffer.from(new Uint8Array(view.buffer as ArrayBuffer, view.byteOffset, view.byteLength))
  }

  private readCookie(cookieHeader: string | undefined, name: string): string | undefined {
    for (const cookie of cookieHeader?.split(';') ?? []) {
      const separator = cookie.indexOf('=')
      if (separator < 0 || cookie.slice(0, separator).trim() !== name) continue
      try {
        return decodeURIComponent(cookie.slice(separator + 1).trim())
      } catch {
        return undefined
      }
    }
    return undefined
  }

  private allowMessage(state: ConnectionState): boolean {
    const now = Date.now()
    if (now - state.messageWindowStartedAt >= 60_000) {
      state.messageWindowStartedAt = now
      state.messageCount = 0
    }
    state.messageCount += 1
    return state.messageCount <= MAX_MESSAGES_PER_MINUTE
  }

  private formatUuid(bytes: Uint8Array): string {
    if (bytes.byteLength !== 16) throw new ForbiddenException()
    const hex = Buffer.from(bytes).toString('hex')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
}
