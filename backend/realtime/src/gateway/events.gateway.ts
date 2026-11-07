import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import Redis from 'ioredis'
import { MetricsService } from '../metrics/metrics.service'

interface WorkspaceClaim {
  id: string
  role: string
}

export interface RealtimeClaims {
  sub: string
  exp: number
  workspaces: WorkspaceClaim[]
}

interface AuthenticatedSocket extends Socket {
  data: Socket['data'] & {
    claims?: RealtimeClaims
    authExpiryTimer?: NodeJS.Timeout
    metricsTracked?: boolean
  }
}

export function verifyRealtimeAccessToken(
  token: string,
  secret = process.env.JWT_ACCESS_SECRET || 'syncspace-jwt-access-secret',
): RealtimeClaims {
  const [header, payload, encodedSignature, ...extra] = token.split('.')
  if (!header || !payload || !encodedSignature || extra.length > 0) {
    throw new Error('Malformed access token')
  }

  const expected = createHmac('sha256', secret).update(`${header}.${payload}`).digest()
  const provided = Buffer.from(encodedSignature, 'base64url')
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new Error('Invalid access token signature')
  }

  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<RealtimeClaims>
  if (
    typeof claims.sub !== 'string' ||
    typeof claims.exp !== 'number' ||
    claims.exp <= Math.floor(Date.now() / 1000) ||
    !Array.isArray(claims.workspaces) ||
    claims.workspaces.some((workspace) =>
      !workspace || typeof workspace.id !== 'string' || typeof workspace.role !== 'string',
    )
  ) {
    throw new Error('Invalid access token claims')
  }

  return claims as RealtimeClaims
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name)
  private subRedis: Redis | null = null

  @WebSocketServer()
  server!: Server

  constructor(private readonly metrics: MetricsService) {}

  afterInit() {
    this.server.use((client: AuthenticatedSocket, next) => {
      try {
        const token = client.handshake.auth?.token
        if (typeof token !== 'string') throw new Error('Missing access token')
        client.data.claims = verifyRealtimeAccessToken(token)
        next()
      } catch {
        next(new Error('Unauthorized'))
      }
    })
    this.logger.log('WebSocket Gateway initialized')
    this.setupRedisSubscriber()
  }

  private setupRedisSubscriber() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    try {
      this.subRedis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      })

      this.subRedis.on('message', (_channel, message) => {
        try {
          const parsed = JSON.parse(message) as {
            type?: string
            payload?: { workspaceId?: string; userId?: string; suspended?: boolean }
          }
          if (
            (parsed.type === 'platform:user-suspended' || parsed.type === 'platform:user-sessions-revoked') &&
            parsed.payload?.userId
          ) {
            for (const socket of this.server.sockets.sockets.values()) {
              const client = socket as AuthenticatedSocket
              if (client.data.claims?.sub === parsed.payload.userId) client.disconnect(true)
            }
            return
          }
          if (parsed.type === 'platform:workspace-suspension-changed' && parsed.payload?.suspended) {
            const workspaceId = parsed.payload.workspaceId
            if (workspaceId) {
              for (const socket of this.server.sockets.sockets.values()) {
                const client = socket as AuthenticatedSocket
                if (client.data.claims?.workspaces.some((workspace) => workspace.id === workspaceId)) {
                  client.leave(`workspace:${workspaceId}`)
                  for (const room of client.rooms) {
                    if (room.startsWith(`doc:${workspaceId}:`)) client.leave(room)
                  }
                }
              }
            }
            return
          }
          const workspaceId = parsed.payload?.workspaceId
          if (this.server && parsed.type && workspaceId) {
            this.server.to(`workspace:${workspaceId}`).emit(parsed.type, parsed.payload)
          }
        } catch (error) {
          this.logger.warn(`Ignoring invalid Redis event: ${error instanceof Error ? error.message : String(error)}`)
        }
      })

      this.subRedis.connect()
        .then(() => {
          this.subRedis?.subscribe('syncspace:events')
          this.logger.log('Subscribed to Redis channel syncspace:events')
        })
        .catch((err: Error) => {
          this.logger.warn(`Could not subscribe to Redis events: ${err.message}`)
        })
    } catch (err: unknown) {
      this.logger.warn(`Redis subscriber init skipped: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  handleConnection(socket: Socket) {
    const client = socket as AuthenticatedSocket
    const claims = client.data.claims
    if (!claims) {
      client.disconnect(true)
      return
    }
    const expiresInMs = claims.exp * 1000 - Date.now()
    if (expiresInMs <= 0) {
      client.disconnect(true)
      return
    }
    client.data.authExpiryTimer = setTimeout(() => client.disconnect(true), expiresInMs)
    this.metrics.connectedClients.inc()
    client.data.metricsTracked = true
    this.logger.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(socket: Socket) {
    const client = socket as AuthenticatedSocket
    if (client.data.authExpiryTimer) clearTimeout(client.data.authExpiryTimer)
    if (client.data.metricsTracked) {
      this.metrics.connectedClients.dec()
      client.data.metricsTracked = false
    }
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('join_workspace')
  handleJoinWorkspace(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    const client = socket as AuthenticatedSocket
    this.metrics.socketEventsTotal.inc({ event: 'join_workspace' })
    if (!this.hasWorkspaceAccess(client, data.workspaceId)) return { status: 'denied' }
    const room = `workspace:${data.workspaceId}`
    client.join(room)
    client.emit('workspace:joined', { room, socketId: client.id })
    return { status: 'joined', room }
  }

  @SubscribeMessage('leave_workspace')
  handleLeaveWorkspace(@ConnectedSocket() client: Socket, @MessageBody() data: { workspaceId: string }) {
    this.metrics.socketEventsTotal.inc({ event: 'leave_workspace' })
    const room = `workspace:${data.workspaceId}`
    client.leave(room)
    return { status: 'left', room }
  }

  @SubscribeMessage('join_document')
  handleJoinDocument(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { documentId: string; workspaceId: string; user?: unknown },
  ) {
    const client = socket as AuthenticatedSocket
    this.metrics.socketEventsTotal.inc({ event: 'join_document' })
    if (!this.hasWorkspaceAccess(client, data.workspaceId)) return { status: 'denied' }
    const room = this.documentRoom(data.workspaceId, data.documentId)
    client.join(room)
    client.to(room).emit('document:user_joined', {
      documentId: data.documentId,
      user: data.user,
      socketId: client.id,
    })
    return { status: 'joined', room }
  }

  @SubscribeMessage('leave_document')
  handleLeaveDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; workspaceId: string; user?: unknown },
  ) {
    const room = this.documentRoom(data.workspaceId, data.documentId)
    client.leave(room)
    client.to(room).emit('document:user_left', {
      documentId: data.documentId,
      user: data.user,
      socketId: client.id,
    })
    return { status: 'left', room }
  }

  @SubscribeMessage('doc_change')
  handleDocChange(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { documentId: string; workspaceId: string; delta: unknown },
  ) {
    const client = socket as AuthenticatedSocket
    this.metrics.socketEventsTotal.inc({ event: 'doc_change' })
    if (!this.hasWorkspaceAccess(client, data.workspaceId)) return { status: 'denied' }
    const room = this.documentRoom(data.workspaceId, data.documentId)
    client.to(room).emit('document:changed', data)
    return { received: true }
  }

  @SubscribeMessage('presence')
  handlePresence(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { workspaceId: string; user: unknown; status: string },
  ) {
    const client = socket as AuthenticatedSocket
    this.metrics.socketEventsTotal.inc({ event: 'presence' })
    if (!this.hasWorkspaceAccess(client, data.workspaceId)) return { status: 'denied' }
    const room = `workspace:${data.workspaceId}`
    client.to(room).emit('presence:updated', data)
    return { acknowledged: true }
  }

  @SubscribeMessage('chat_message')
  handleChatMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { workspaceId: string; message: string; author: string },
  ) {
    const client = socket as AuthenticatedSocket
    this.metrics.socketEventsTotal.inc({ event: 'chat_message' })
    if (!this.hasWorkspaceAccess(client, data.workspaceId)) return { status: 'denied' }
    const room = `workspace:${data.workspaceId}`
    const payload = {
      ...data,
      author: client.data.claims?.sub,
      timestamp: new Date().toISOString(),
      id: `msg-${Date.now().toString(36)}`,
    }
    this.server.to(room).emit('chat:received', payload)
    return payload
  }

  private hasWorkspaceAccess(client: AuthenticatedSocket, workspaceId: string) {
    const claims = client.data.claims
    return Boolean(
      claims &&
      claims.exp * 1000 > Date.now() &&
      claims.workspaces.some((workspace) => workspace.id === workspaceId),
    )
  }

  private documentRoom(workspaceId: string, documentId: string) {
    return `doc:${workspaceId}:${documentId}`
  }
}
