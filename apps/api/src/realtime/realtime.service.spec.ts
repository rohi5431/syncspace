import { jest } from '@jest/globals'
import { ForbiddenException } from '@nestjs/common'
import { Awareness } from 'y-protocols/awareness'
import * as Y from 'yjs'
import WebSocket from 'ws'
import { PresenceService } from './presence/presence.service'
import { RealtimeService, type RealtimeRoom } from './realtime.service'
import { YjsService } from './collaboration/yjs.service'

describe('RealtimeService', () => {
  const sessions = { isActive: jest.fn() }
  const documents = { getAccess: jest.fn() }
  let service: RealtimeService
  let document: Y.Doc
  let room: RealtimeRoom

  beforeEach(() => {
    jest.clearAllMocks()
    service = new RealtimeService({ flushDocumentJson: jest.fn() } as never, new PresenceService(), new YjsService(), sessions as never, documents as never)
    document = new Y.Doc()
    room = {
      documentId: 'document-id',
      createdById: 'user-owner',
      document,
      awareness: new Awareness(document),
      clients: new Map(),
      awarenessOwners: new Map(),
      updatesSinceSnapshot: 0,
      lastActorId: 'user-owner',
      writeQueue: Promise.resolve(),
    }
  })

  afterEach(() => {
    room.awareness.destroy()
    document.destroy()
  })

  it('allows a connected socket only while its session and document access remain valid', async () => {
    const socket = createSocket()
    room.clients.set(socket, { id: 'user-editor', name: 'Editor', avatarUrl: null, color: '#635BDB', sessionId: 'session-id' })
    sessions.isActive.mockResolvedValue(true)
    documents.getAccess.mockResolvedValue({ canRead: true })

    await expect(service.ensureSocketAccess(room, socket)).resolves.toBe(true)
    expect(sessions.isActive).toHaveBeenCalledWith('session-id', 'user-editor')
    expect(documents.getAccess).toHaveBeenCalledWith('document-id', 'user-editor')
    expect(socket.close).not.toHaveBeenCalled()
  })

  it('closes and removes a socket immediately when document access is revoked', async () => {
    const revokedSocket = createSocket()
    const remainingSocket = createSocket()
    room.clients.set(revokedSocket, { id: 'user-viewer', name: 'Viewer', avatarUrl: null, color: '#D946A6', sessionId: 'session-id' })
    room.clients.set(remainingSocket, { id: 'user-editor', name: 'Editor', avatarUrl: null, color: '#168BA7', sessionId: 'active-session' })
    sessions.isActive.mockResolvedValue(true)
    documents.getAccess.mockRejectedValue(new ForbiddenException())

    await expect(service.ensureSocketAccess(room, revokedSocket)).resolves.toBe(false)

    expect(revokedSocket.close).toHaveBeenCalledWith(4403, expect.any(String))
    expect(room.clients.has(revokedSocket)).toBe(false)
    expect(room.clients.has(remainingSocket)).toBe(true)
  })
})

function createSocket(): WebSocket {
  return {
    readyState: WebSocket.OPEN,
    close: jest.fn(),
    send: jest.fn(),
  } as unknown as WebSocket
}
