import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import type { DocumentDetail } from '@syncspace/contracts'
import { REALTIME_FRAME } from '@syncspace/contracts'
import { Awareness, encodeAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness'
import * as Y from 'yjs'
import WebSocket from 'ws'
import { SessionService } from '../auth/session.service'
import { DocumentsService } from '../documents/documents.service'
import { DocumentPersistenceService } from './persistence/document-persistence.service'
import { PresenceService, type RealtimeIdentity, type RealtimePresenceUser } from './presence/presence.service'
import { YjsService } from './collaboration/yjs.service'

const SNAPSHOT_UPDATE_THRESHOLD = 100
const DOCUMENT_FLUSH_DELAY_MS = 1_500
const ROOM_IDLE_TIMEOUT_MS = 5 * 60_000

type RealtimeConnectionIdentity = RealtimeIdentity & { sessionId: string }

export interface RealtimeRoom {
  documentId: string
  createdById: string
  document: Y.Doc
  awareness: Awareness
  clients: Map<WebSocket, RealtimeConnectionIdentity>
  awarenessOwners: Map<number, WebSocket>
  updatesSinceSnapshot: number
  lastActorId: string
  writeQueue: Promise<void>
  flushTimer?: NodeJS.Timeout
  idleTimer?: NodeJS.Timeout
  flushPromise?: Promise<void>
}

@Injectable()
export class RealtimeService implements OnApplicationShutdown {
  private readonly logger = new Logger(RealtimeService.name)
  private readonly rooms = new Map<string, RealtimeRoom | Promise<RealtimeRoom>>()

  constructor(
    private readonly persistence: DocumentPersistenceService,
    private readonly presence: PresenceService,
    private readonly yjs: YjsService,
    private readonly sessions: SessionService,
    private readonly documents: DocumentsService,
  ) {}

  async join(
    document: DocumentDetail,
    socket: WebSocket,
    identity: Omit<RealtimeIdentity, 'color'> & { sessionId: string },
  ): Promise<{ room: RealtimeRoom; user: RealtimeIdentity; users: RealtimePresenceUser[] }> {
    const room = await this.getOrCreateRoom(document)
    if (room.idleTimer) {
      clearTimeout(room.idleTimer)
      room.idleTimer = undefined
    }

    const { user, users } = this.presence.join(document.id, socket, identity)
    room.clients.set(socket, { ...user, sessionId: identity.sessionId })
    return { room, user, users }
  }

  touch(documentId: string, socket: WebSocket): void {
    this.presence.touch(documentId, socket)
  }

  async ensureSocketAccess(room: RealtimeRoom, socket: WebSocket): Promise<boolean> {
    const identity = room.clients.get(socket)
    try {
      if (identity && await this.sessions.isActive(identity.sessionId, identity.id)) {
        if ((await this.documents.getAccess(room.documentId, identity.id)).canRead) return true
      }
    } catch {
      // Treat deleted documents and access lookup failures as revoked access.
    }

    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close(4403, 'You no longer have permission to access this document.')
    }
    await this.leave(room, socket)
    return false
  }

  listPresence(documentId: string): RealtimePresenceUser[] {
    return this.presence.list(documentId)
  }

  async persistUpdate(
    room: RealtimeRoom,
    socket: WebSocket,
    actorId: string,
    update: Uint8Array,
  ): Promise<boolean> {
    return this.enqueue(room, async () => {
      this.yjs.validateUpdate(update)
      if (!this.yjs.hasChanges(update)) return false
      const inserted = await this.persistence.appendUpdate(room.documentId, actorId, update)
      Y.applyUpdate(room.document, update, socket)

      if (inserted) {
        room.updatesSinceSnapshot += 1
        room.lastActorId = actorId
        this.scheduleDocumentFlush(room)

        if (room.updatesSinceSnapshot >= SNAPSHOT_UPDATE_THRESHOLD) {
          try {
            await this.persistence.createSnapshot(
              room.documentId,
              actorId,
              room.document,
              room.updatesSinceSnapshot,
            )
            room.updatesSinceSnapshot = 0
          } catch {
            this.logger.warn(`Snapshot creation deferred for document ${room.documentId}; binary updates remain durable.`)
          }
        }
      }

      return inserted
    })
  }

  async leave(room: RealtimeRoom, socket: WebSocket): Promise<RealtimePresenceUser[]> {
    const ownedAwarenessIds = [...room.awarenessOwners.entries()]
      .filter(([, owner]) => owner === socket)
      .map(([clientId]) => clientId)

    for (const clientId of ownedAwarenessIds) room.awarenessOwners.delete(clientId)
    if (ownedAwarenessIds.length) removeAwarenessStates(room.awareness, ownedAwarenessIds, socket)

    room.clients.delete(socket)
    const users = this.presence.leave(room.documentId, socket)
    if (room.clients.size === 0) {
      void this.flushDocument(room)
      room.idleTimer = setTimeout(() => this.destroyRoom(room.documentId), ROOM_IDLE_TIMEOUT_MS)
      room.idleTimer.unref?.()
    }
    return users
  }

  getAwarenessUpdate(room: RealtimeRoom): Uint8Array | null {
    const clientIds = [...room.awareness.getStates().keys()]
      .filter((clientId) => clientId !== room.awareness.clientID)
    return clientIds.length ? encodeAwarenessUpdate(room.awareness, clientIds) : null
  }

  async onApplicationShutdown(): Promise<void> {
    const rooms = await Promise.all([...this.rooms.values()].map((room) => Promise.resolve(room)))
    await Promise.all(rooms.map((room) => this.flushDocument(room)))
    for (const room of rooms) this.destroyRoom(room.documentId)
  }

  private async getOrCreateRoom(document: DocumentDetail): Promise<RealtimeRoom> {
    const existing = this.rooms.get(document.id)
    if (existing) return Promise.resolve(existing)

    const pending = this.persistence.load({
      documentId: document.id,
      legacyContent: document.content,
      createdById: document.createdById,
    }).then(({ document: yDocument, updateCountSinceSnapshot }) => {
      const awareness = new Awareness(yDocument)
      const room: RealtimeRoom = {
        documentId: document.id,
        createdById: document.createdById,
        document: yDocument,
        awareness,
        clients: new Map(),
        awarenessOwners: new Map(),
        updatesSinceSnapshot: updateCountSinceSnapshot,
        lastActorId: document.createdById,
        writeQueue: Promise.resolve(),
      }

      awareness.on('update', ({ added, updated, removed }, origin) => {
        const changedClients = [...added, ...updated, ...removed]
        if (!changedClients.length) return
        const update = encodeAwarenessUpdate(awareness, changedClients)
        const packet = this.encodeFrame(REALTIME_FRAME.serverAwareness, update)
        void this.broadcastAwareness(room, origin, packet)
      })

      return room
    })

    this.rooms.set(document.id, pending)
    try {
      const room = await pending
      this.rooms.set(document.id, room)
      return room
    } catch (error) {
      this.rooms.delete(document.id)
      throw error
    }
  }

  private scheduleDocumentFlush(room: RealtimeRoom): void {
    if (room.flushTimer) clearTimeout(room.flushTimer)
    room.flushTimer = setTimeout(() => {
      room.flushTimer = undefined
      void this.flushDocument(room)
    }, DOCUMENT_FLUSH_DELAY_MS)
    room.flushTimer.unref?.()
  }

  private flushDocument(room: RealtimeRoom): Promise<void> {
    if (room.flushTimer) {
      clearTimeout(room.flushTimer)
      room.flushTimer = undefined
    }
    if (room.flushPromise) return room.flushPromise

    room.flushPromise = (async () => {
      await room.writeQueue
      await this.persistence.flushDocumentJson(room.documentId, room.document)
    })()
      .catch(() => {
        this.logger.warn(`Document JSON materialization deferred for document ${room.documentId}; Yjs storage remains authoritative.`)
      })
      .finally(() => {
        room.flushPromise = undefined
      })

    return room.flushPromise
  }

  private async destroyRoom(documentId: string): Promise<void> {
    const stored = this.rooms.get(documentId)
    if (!stored) return
    const room = await Promise.resolve(stored)
    if (room.clients.size) return

    await this.flushDocument(room)
    if (room.clients.size) return
    if (room.idleTimer) clearTimeout(room.idleTimer)
    if (room.flushTimer) clearTimeout(room.flushTimer)
    room.awareness.destroy()
    room.document.destroy()
    this.rooms.delete(documentId)
  }

  private async enqueue<T>(room: RealtimeRoom, operation: () => Promise<T>): Promise<T> {
    const result = room.writeQueue.then(operation)
    room.writeQueue = result.then(() => undefined, () => undefined)
    return result
  }

  private async broadcastAwareness(room: RealtimeRoom, origin: unknown, packet: Buffer): Promise<void> {
    await Promise.all([...room.clients.keys()].map(async (socket) => {
      if (socket === origin || socket.readyState !== WebSocket.OPEN) return
      if (await this.ensureSocketAccess(room, socket)) socket.send(packet)
    }))
  }

  private encodeFrame(type: number, payload: Uint8Array): Buffer {
    const frame = Buffer.allocUnsafe(payload.byteLength + 1)
    frame[0] = type
    frame.set(payload, 1)
    return frame
  }
}
