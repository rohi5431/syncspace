'use client'

import { IndexeddbPersistence } from 'y-indexeddb'
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness'
import * as Y from 'yjs'
import { REALTIME_FRAME } from '@syncspace/contracts'

export type CollaborationStatus = 'connecting' | 'offline' | 'syncing' | 'saving' | 'synced' | 'error'
export type RealtimeCollaborator = {
  id: string
  name: string
  avatarUrl: string | null
  color: string
  isOnline: true
  lastActiveAt: string
  connections: number
}

type ProviderListener = (value: any) => void

const REMOTE_DOCUMENT_ORIGIN = Symbol('syncspace:remote-document')
const REMOTE_AWARENESS_ORIGIN = Symbol('syncspace:remote-awareness')
const AWARENESS_THROTTLE_MS = 60
const UPDATE_THROTTLE_MS = 80
const MAX_RECONNECT_DELAY_MS = 8_000

export class YjsWebSocketProvider {
  readonly awareness: Awareness
  readonly persistence: IndexeddbPersistence
  canEdit: boolean
  collaborators: RealtimeCollaborator[] = []
  currentUser: { id: string; name: string; avatarUrl: string | null; color: string }

  private readonly listeners = new Map<string, Set<ProviderListener>>()
  private socket?: WebSocket
  private serverStateVector?: Uint8Array
  private reconnectTimer?: ReturnType<typeof setTimeout>
  private updateTimer?: ReturnType<typeof setTimeout>
  private awarenessTimer?: ReturnType<typeof setTimeout>
  private reconnectAttempts = 0
  private pendingUpdateIds = new Set<string>()
  private pendingLocalUpdates: Uint8Array[] = []
  private syncPhase: 'waiting-state-vector' | 'waiting-server-state' | 'waiting-ack' | 'synced' = 'waiting-state-vector'
  private status: CollaborationStatus = 'connecting'
  private destroyed = false
  private fatalClose = false
  private started = false

  private readonly handleDocumentUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === REMOTE_DOCUMENT_ORIGIN || this.destroyed || !this.canEdit) return
    this.pendingLocalUpdates.push(update.slice())
    this.setStatus(this.socket?.readyState === WebSocket.OPEN ? 'saving' : 'offline')
    if (this.syncPhase === 'synced') this.scheduleUpdateFlush()
  }

  private readonly handleAwarenessUpdate = ({ added, updated, removed }: {
    added: number[]
    updated: number[]
    removed: number[]
  }, origin: unknown) => {
    if (origin === REMOTE_AWARENESS_ORIGIN || this.destroyed) return
    if (![...added, ...updated, ...removed].includes(this.awareness.clientID)) return
    this.scheduleAwarenessFlush()
  }

  constructor(
    readonly documentId: string,
    readonly document: Y.Doc,
    identity: { id?: string; name?: string; avatarUrl?: string | null },
    initialCanEdit: boolean,
  ) {
    this.canEdit = initialCanEdit
    this.currentUser = {
      id: identity.id ?? 'current-user',
      name: identity.name ?? 'You',
      avatarUrl: identity.avatarUrl ?? null,
      color: colorForUser(identity.id ?? 'current-user'),
    }
    this.awareness = new Awareness(document)
    this.persistence = new IndexeddbPersistence(`syncspace-document-${documentId}`, document)
    this.document.on('update', this.handleDocumentUpdate)
    this.awareness.on('update', this.handleAwarenessUpdate)
    this.awareness.setLocalStateField('user', this.currentUser)
  }

  get connectionStatus(): CollaborationStatus {
    return this.status
  }

  updateIdentity(identity: { id: string; name: string; avatarUrl: string | null }): void {
    this.currentUser = { ...identity, color: colorForUser(identity.id) }
    this.awareness.setLocalStateField('user', this.currentUser)
  }

  async flushAndWait(timeoutMs = 15_000): Promise<boolean> {
    this.flushPendingUpdates()
    if (this.status === 'synced' && this.pendingUpdateIds.size === 0 && this.pendingLocalUpdates.length === 0) {
      return true
    }

    return new Promise((resolve) => {
      const finish = (result: boolean) => {
        clearTimeout(timeout)
        this.off('status', onStatus)
        resolve(result)
      }
      const onStatus = () => {
        if (this.status === 'synced' && this.pendingUpdateIds.size === 0 && this.pendingLocalUpdates.length === 0) {
          finish(true)
        }
      }
      const timeout = setTimeout(() => finish(false), timeoutMs)
      this.on('status', onStatus)
      onStatus()
    })
  }

  on(event: string, listener: ProviderListener): this {
    const listeners = this.listeners.get(event) ?? new Set<ProviderListener>()
    listeners.add(listener)
    this.listeners.set(event, listeners)
    return this
  }

  off(event: string, listener: ProviderListener): this {
    this.listeners.get(event)?.delete(listener)
    return this
  }

  connect(): void {
    if (this.destroyed || this.started) return
    this.started = true
    this.openSocket()
  }

  reconnect(): void {
    if (this.destroyed) return
    this.fatalClose = false
    this.reconnectAttempts = 0
    this.pendingUpdateIds.clear()
    this.openSocket()
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.document.off('update', this.handleDocumentUpdate)
    this.awareness.off('update', this.handleAwarenessUpdate)
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.updateTimer) clearTimeout(this.updateTimer)
    if (this.awarenessTimer) clearTimeout(this.awarenessTimer)
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.awareness.setLocalState(null)
      const update = encodeAwarenessUpdate(this.awareness, [this.awareness.clientID])
      this.sendFrame(REALTIME_FRAME.clientAwareness, update)
      this.sendJson('document:leave', {})
      this.socket.close(1000, 'Document closed.')
    } else {
      this.socket?.close()
    }
    this.awareness.destroy()
    void this.persistence.destroy()
    this.listeners.clear()
  }

  private openSocket(): void {
    if (this.destroyed || this.fatalClose) return
    if (this.socket && this.socket.readyState < WebSocket.CLOSING) this.socket.close()
    this.syncPhase = 'waiting-state-vector'
    this.serverStateVector = undefined
    this.setStatus('connecting')

    let socket: WebSocket
    try {
      socket = new WebSocket(getRealtimeUrl())
    } catch (cause) {
      this.fatalClose = true
      this.setStatus('error')
      this.emit('error', { message: cause instanceof Error ? cause.message : 'The realtime endpoint is not configured.' })
      return
    }
    socket.binaryType = 'arraybuffer'
    this.socket = socket

    socket.addEventListener('open', () => {
      if (this.destroyed || socket !== this.socket) return
      this.reconnectAttempts = 0
      this.sendJson('document:join', {
        documentId: this.documentId,
        clientId: this.document.clientID,
      })
      this.setStatus('syncing')
    })

    socket.addEventListener('message', (event) => {
      if (socket !== this.socket || this.destroyed) return
      if (typeof event.data === 'string') this.handleJsonMessage(event.data)
      else if (event.data instanceof ArrayBuffer) this.handleBinaryMessage(new Uint8Array(event.data))
      else if (ArrayBuffer.isView(event.data)) {
        const view = event.data as ArrayBufferView
        this.handleBinaryMessage(new Uint8Array(view.buffer as ArrayBuffer, view.byteOffset, view.byteLength))
      }
    })

    socket.addEventListener('error', () => {
      if (socket === this.socket) this.setStatus('error')
    })

    socket.addEventListener('close', (event) => {
      if (socket !== this.socket || this.destroyed) return
      this.pendingUpdateIds.clear()
      this.syncPhase = 'waiting-state-vector'
      const fatal = [4401, 4403, 4404].includes(event.code)
      if (fatal) {
        this.fatalClose = true
        this.setStatus('error')
        this.emit('error', { message: event.reason || 'You no longer have access to this document.' })
        return
      }
      this.setStatus('offline')
      this.scheduleReconnect()
    })
  }

  private handleJsonMessage(text: string): void {
    let message: { event?: string; data?: Record<string, unknown> }
    try {
      message = JSON.parse(text) as { event?: string; data?: Record<string, unknown> }
    } catch {
      return
    }

    const data = message.data ?? {}
    if (message.event === 'document:ready') {
      this.canEdit = Boolean(data.canEdit)
      if (data.user && typeof data.user === 'object') {
        const user = data.user as { id?: string; name?: string; avatarUrl?: string | null; color?: string }
        this.currentUser = {
          id: user.id ?? this.currentUser.id,
          name: user.name ?? this.currentUser.name,
          avatarUrl: user.avatarUrl ?? null,
          color: user.color ?? this.currentUser.color,
        }
        this.awareness.setLocalStateField('user', this.currentUser)
        this.emit('user', this.currentUser)
      }
      this.collaborators = Array.isArray(data.collaborators) ? data.collaborators as RealtimeCollaborator[] : []
      this.emit('presence', this.collaborators)
      this.emit('permissions', { canEdit: this.canEdit })
      return
    }

    if (message.event === 'presence:update') {
      this.collaborators = Array.isArray(data.collaborators) ? data.collaborators as RealtimeCollaborator[] : []
      this.emit('presence', this.collaborators)
      return
    }

    if (message.event === 'document:ack' && typeof data.updateId === 'string') {
      this.pendingUpdateIds.delete(data.updateId)
      this.emit('ack', { updateId: data.updateId, durable: data.durable === true })
      if (this.syncPhase === 'synced') {
        this.setStatus(this.pendingUpdateIds.size ? 'saving' : 'synced')
      }
      return
    }

    if (message.event === 'document:synced') {
      this.finishSync()
      return
    }

    if (message.event === 'collaboration:error') {
      this.setStatus('error')
      this.emit('error', { message: typeof data.message === 'string' ? data.message : 'Collaboration is unavailable.' })
    }
  }

  private handleBinaryMessage(frame: Uint8Array): void {
    if (frame.byteLength < 2) return
    const type = frame[0]
    const payload = frame.subarray(1)

    if (type === REALTIME_FRAME.serverStateVector) {
      this.serverStateVector = payload.slice()
      if (this.syncPhase === 'waiting-state-vector') {
        this.syncPhase = 'waiting-server-state'
        this.sendFrame(REALTIME_FRAME.clientStateVector, Y.encodeStateVector(this.document))
      }
      return
    }

    if (type === REALTIME_FRAME.serverSyncUpdate) {
      Y.applyUpdate(this.document, payload, REMOTE_DOCUMENT_ORIGIN)
      this.sendInitialLocalDifference()
      this.syncPhase = 'waiting-ack'
      this.sendJson('document:sync-complete', {})
      return
    }

    if (type === REALTIME_FRAME.serverUpdate) {
      Y.applyUpdate(this.document, payload, REMOTE_DOCUMENT_ORIGIN)
      return
    }

    if (type === REALTIME_FRAME.serverAwareness) {
      applyAwarenessUpdate(this.awareness, payload, REMOTE_AWARENESS_ORIGIN)
    }
  }

  private sendInitialLocalDifference(): void {
    if (!this.serverStateVector || !this.canEdit) {
      this.pendingLocalUpdates = []
      return
    }

    const difference = Y.encodeStateAsUpdate(this.document, this.serverStateVector)
    this.pendingLocalUpdates = []
    if (hasYjsChanges(difference)) this.sendUpdate(difference)
  }

  private finishSync(): void {
    const difference = this.canEdit && this.serverStateVector
      ? Y.encodeStateAsUpdate(this.document, this.serverStateVector)
      : new Uint8Array()
    if (hasYjsChanges(difference)) {
      this.pendingLocalUpdates = []
      this.syncPhase = 'waiting-ack'
      this.sendUpdate(difference)
      this.sendJson('document:sync-complete', {})
      this.setStatus('syncing')
      return
    }

    this.pendingLocalUpdates = []
    this.syncPhase = 'synced'
    this.emit('synced', { state: true })
    this.setStatus(this.pendingUpdateIds.size ? 'saving' : 'synced')
    this.flushAwareness()
  }

  private scheduleUpdateFlush(): void {
    if (this.updateTimer || this.destroyed) return
    this.updateTimer = setTimeout(() => {
      this.updateTimer = undefined
      this.flushPendingUpdates()
    }, UPDATE_THROTTLE_MS)
  }

  private flushPendingUpdates(): void {
    if (this.destroyed || this.syncPhase !== 'synced' || this.socket?.readyState !== WebSocket.OPEN) return
    const updates = this.pendingLocalUpdates.splice(0)
    if (!updates.length) return
    const merged = updates.length === 1 ? updates[0] : Y.mergeUpdates(updates)
    if (!hasYjsChanges(merged)) return
    this.sendUpdate(merged)
    this.setStatus('saving')
  }

  private sendUpdate(update: Uint8Array): void {
    const updateId = crypto.randomUUID()
    const idBytes = uuidToBytes(updateId)
    const payload = new Uint8Array(idBytes.length + update.length)
    payload.set(idBytes, 0)
    payload.set(update, idBytes.length)
    this.pendingUpdateIds.add(updateId)
    this.sendFrame(REALTIME_FRAME.clientUpdate, payload)
  }

  private scheduleAwarenessFlush(): void {
    if (this.awarenessTimer || this.destroyed) return
    this.awarenessTimer = setTimeout(() => {
      this.awarenessTimer = undefined
      this.flushAwareness()
    }, AWARENESS_THROTTLE_MS)
  }

  private flushAwareness(): void {
    if (this.destroyed || this.socket?.readyState !== WebSocket.OPEN) return
    const update = encodeAwarenessUpdate(this.awareness, [this.awareness.clientID])
    this.sendFrame(REALTIME_FRAME.clientAwareness, update)
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.destroyed || this.fatalClose) return
    const delay = Math.min(500 * 2 ** this.reconnectAttempts, MAX_RECONNECT_DELAY_MS)
    this.reconnectAttempts += 1
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined
      this.openSocket()
    }, delay)
  }

  private sendJson(event: string, data: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }))
    }
  }

  private sendFrame(type: number, payload: Uint8Array): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return
    const frame = new Uint8Array(payload.byteLength + 1)
    frame[0] = type
    frame.set(payload, 1)
    this.socket.send(frame)
  }

  private setStatus(status: CollaborationStatus): void {
    if (this.status === status) return
    this.status = status
    this.emit('status', { status })
  }

  private emit(event: string, value: unknown): void {
    for (const listener of this.listeners.get(event) ?? []) listener(value)
  }
}

export function getRealtimeUrl(): string {
  const { hostname, protocol } = window.location
  const configuredUrl = process.env.NEXT_PUBLIC_REALTIME_URL?.trim()

  if (configuredUrl) {
    const url = new URL(configuredUrl)
    if (!['ws:', 'wss:'].includes(url.protocol)) {
      throw new Error('NEXT_PUBLIC_REALTIME_URL must use ws:// or wss://.')
    }
    if (protocol === 'https:' && url.protocol !== 'wss:') {
      throw new Error('The realtime endpoint must use wss:// on secure pages.')
    }
    return url.toString()
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `ws://${hostname}:4000/realtime`
  }

  throw new Error('Set NEXT_PUBLIC_REALTIME_URL to the direct WebSocket endpoint for the deployed SyncSpace API.')
}

function hasYjsChanges(update: Uint8Array): boolean {
  if (update.byteLength < 2) return false
  const decoded = Y.decodeUpdate(update)
  return decoded.structs.length > 0 || decoded.ds.clients.size > 0
}

function uuidToBytes(value: string): Uint8Array {
  const hex = value.replaceAll('-', '')
  const bytes = new Uint8Array(16)
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }
  return bytes
}

function colorForUser(userId: string): string {
  const colors = ['#635BDB', '#D946A6', '#168BA7', '#13835F', '#C47A16', '#CC4654']
  let hash = 0
  for (const character of userId) hash = (hash * 31 + character.charCodeAt(0)) | 0
  return colors[Math.abs(hash) % colors.length]
}
