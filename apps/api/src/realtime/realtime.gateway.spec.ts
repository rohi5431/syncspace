import { jest } from '@jest/globals'
import { once } from 'node:events'
import { ACCESS_COOKIE } from '../auth/auth.cookies'
import { PresenceService } from './presence/presence.service'
import { RealtimeGateway } from './realtime.gateway'
import { RealtimeService } from './realtime.service'
import { YjsService } from './collaboration/yjs.service'
import { REALTIME_FRAME } from '@syncspace/contracts'
import * as Y from 'yjs'
import WebSocket, { WebSocketServer } from 'ws'

const DOCUMENT_ID = '5f3d31cb-77df-4b7c-9f88-cd108a693a1a'
const USER_ID = 'f0cddbe6-6aad-45a0-a244-79ee48d19c42'

type ReceivedMessage = { data: Buffer; isBinary: boolean }
type TestClient = {
  socket: WebSocket
  document: Y.Doc
  next: (matches: (message: ReceivedMessage) => boolean) => Promise<ReceivedMessage>
  sendFrame: (type: number, payload: Uint8Array) => void
}

describe('RealtimeGateway collaboration sessions', () => {
  const user = { id: USER_ID, name: 'Collaborator', avatarUrl: null }
  const document = {
    id: DOCUMENT_ID,
    title: 'Shared plan',
    content: { type: 'doc', content: [] },
    createdById: USER_ID,
  }
  const sessions = { isActive: jest.fn() }
  const documents = { getAccess: jest.fn() }
  const persistence = {
    load: jest.fn(),
    appendUpdate: jest.fn(),
    createSnapshot: jest.fn(),
    flushDocumentJson: jest.fn(),
  }
  let realtime: RealtimeService
  let gateway: RealtimeGateway
  let server: WebSocketServer
  let url: string
  const clients: TestClient[] = []

  beforeAll(async () => {
    realtime = new RealtimeService(persistence as never, new PresenceService(), new YjsService(), sessions as never, documents as never)
    const config = { get: (_key: string, fallback: string) => fallback }
    const jwt = {
      verifyAsync: jest.fn(async (token: string) => ({ sub: USER_ID, sid: token === 'session-a' ? 'sid-a' : 'sid-b' })),
    }
    const database = {
      db: {
        select: () => ({ from: () => ({ where: () => ({ limit: async () => [user] }) }) }),
      },
    }
    gateway = new RealtimeGateway(config as never, jwt as never, sessions as never, database as never, documents as never, realtime, new PresenceService())

    server = new WebSocketServer({ port: 0 })
    server.on('connection', (socket, request) => gateway.handleConnection(socket, request))
    await once(server, 'listening')
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('WebSocket test server did not bind a TCP port.')
    url = `ws://127.0.0.1:${address.port}/realtime`
  })

  beforeEach(() => {
    jest.clearAllMocks()
    sessions.isActive.mockResolvedValue(true)
    documents.getAccess.mockResolvedValue({ document, canRead: true, canEdit: true })
    persistence.load.mockImplementation(async () => ({ document: new Y.Doc(), updateCountSinceSnapshot: 0 }))
    persistence.appendUpdate.mockResolvedValue(true)
    persistence.createSnapshot.mockResolvedValue(undefined)
    persistence.flushDocumentJson.mockResolvedValue(undefined)
  })

  afterEach(async () => {
    await Promise.all(clients.splice(0).map(closeClient))
    await realtime.onApplicationShutdown()
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  })

  it('merges simultaneous binary updates across two independently authenticated connections', async () => {
    const first = await connectClient('session-a')
    const second = await connectClient('session-b')
    await joinAndSync(first)
    await joinAndSync(second)

    const emptyState = new Y.Doc()
    const baseVector = Y.encodeStateVector(emptyState)
    emptyState.destroy()
    first.document.getText('default').insert(0, 'First')
    second.document.getText('default').insert(0, 'Second')
    const firstUpdate = Y.encodeStateAsUpdate(first.document, baseVector)
    const secondUpdate = Y.encodeStateAsUpdate(second.document, baseVector)

    first.sendFrame(REALTIME_FRAME.clientUpdate, withUpdateId(firstUpdate))
    second.sendFrame(REALTIME_FRAME.clientUpdate, withUpdateId(secondUpdate))

    await first.next((message) => isJsonEvent(message, 'document:ack'))
    await second.next((message) => isJsonEvent(message, 'document:ack'))
    const firstRemoteUpdate = await first.next((message) => isFrame(message, REALTIME_FRAME.serverUpdate))
    const secondRemoteUpdate = await second.next((message) => isFrame(message, REALTIME_FRAME.serverUpdate))
    Y.applyUpdate(first.document, firstRemoteUpdate.data.subarray(1))
    Y.applyUpdate(second.document, secondRemoteUpdate.data.subarray(1))

    expect(first.document.getText('default').toString()).toBe(second.document.getText('default').toString())
    expect(first.document.getText('default').toString()).toContain('First')
    expect(first.document.getText('default').toString()).toContain('Second')
    expect(persistence.appendUpdate).toHaveBeenCalledTimes(2)
  })

  async function connectClient(token: string): Promise<TestClient> {
    const socket = new WebSocket(url, {
      headers: {
        cookie: `${ACCESS_COOKIE}=${token}`,
        origin: 'http://localhost:3000',
      },
    })
    const queue: ReceivedMessage[] = []
    const waiters: Array<{ matches: (message: ReceivedMessage) => boolean; resolve: (message: ReceivedMessage) => void }> = []
    socket.on('message', (data, isBinary) => {
      const message = { data: Buffer.isBuffer(data) ? data : Buffer.from(data as never), isBinary }
      const waiterIndex = waiters.findIndex((waiter) => waiter.matches(message))
      if (waiterIndex >= 0) waiters.splice(waiterIndex, 1)[0].resolve(message)
      else queue.push(message)
    })
    await new Promise<void>((resolve, reject) => {
      socket.once('open', () => resolve())
      socket.once('error', reject)
    })

    const client: TestClient = {
      socket,
      document: new Y.Doc(),
      next: (matches) => {
        const queuedIndex = queue.findIndex(matches)
        if (queuedIndex >= 0) return Promise.resolve(queue.splice(queuedIndex, 1)[0])
        return new Promise((resolve) => waiters.push({ matches, resolve }))
      },
      sendFrame: (type, payload) => {
        const frame = Buffer.allocUnsafe(payload.byteLength + 1)
        frame[0] = type
        frame.set(payload, 1)
        socket.send(frame)
      },
    }
    clients.push(client)
    return client
  }

  async function joinAndSync(client: TestClient): Promise<void> {
    client.socket.send(JSON.stringify({ event: 'document:join', data: { documentId: DOCUMENT_ID, clientId: client.document.clientID } }))
    await client.next((message) => isJsonEvent(message, 'document:ready'))
    await client.next((message) => isFrame(message, REALTIME_FRAME.serverStateVector))
    const empty = new Y.Doc()
    client.sendFrame(REALTIME_FRAME.clientStateVector, Y.encodeStateVector(empty))
    empty.destroy()
    const initialState = await client.next((message) => isFrame(message, REALTIME_FRAME.serverSyncUpdate))
    Y.applyUpdate(client.document, initialState.data.subarray(1))
    client.socket.send(JSON.stringify({ event: 'document:sync-complete', data: {} }))
    await client.next((message) => isFrame(message, REALTIME_FRAME.serverStateVector))
    await client.next((message) => isJsonEvent(message, 'document:synced'))
  }

  function withUpdateId(update: Uint8Array): Uint8Array {
    const id = Buffer.from('a2482d58c55148ccab7f6b5f2c75b199', 'hex')
    const result = new Uint8Array(id.length + update.length)
    result.set(id)
    result.set(update, id.length)
    return result
  }

  function isFrame(message: ReceivedMessage, type: number): boolean {
    return message.isBinary && message.data[0] === type
  }

  function isJsonEvent(message: ReceivedMessage, event: string): boolean {
    if (message.isBinary) return false
    try {
      return JSON.parse(message.data.toString('utf8')).event === event
    } catch {
      return false
    }
  }

  async function closeClient(client: TestClient): Promise<void> {
    client.document.destroy()
    if (client.socket.readyState === WebSocket.CLOSED) return
    await new Promise<void>((resolve) => {
      client.socket.once('close', () => resolve())
      client.socket.close()
    })
  }
})
