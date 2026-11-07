import { createHmac } from 'node:crypto'
import { EventsGateway, verifyRealtimeAccessToken } from '../src/gateway/events.gateway'
import { MetricsService } from '../src/metrics/metrics.service'

describe('EventsGateway', () => {
  const secret = 'test-secret'
  let gateway: EventsGateway
  let metricsService: MetricsService
  let mockSocket: any
  let mockServer: any
  let roomEmitter: { emit: jest.Mock }

  const tokenFor = (claims: object) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64url')
    const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
    return `${header}.${payload}.${signature}`
  }

  beforeEach(() => {
    metricsService = new MetricsService()
    gateway = new EventsGateway(metricsService)
    roomEmitter = { emit: jest.fn() }
    mockSocket = {
      id: 'sock-1',
      data: {
        claims: {
          sub: 'user-1',
          exp: Math.floor(Date.now() / 1000) + 60,
          workspaces: [{ id: 'ws-1', role: 'ADMIN' }],
        },
      },
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      to: jest.fn().mockReturnThis(),
    }
    mockServer = {
      emit: jest.fn(),
      to: jest.fn().mockReturnValue(roomEmitter),
    }
    gateway.server = mockServer
  })

  it('verifies signed, unexpired tokens with workspace claims', () => {
    const claims = {
      sub: 'user-1',
      exp: Math.floor(Date.now() / 1000) + 60,
      workspaces: [{ id: 'ws-1', role: 'ADMIN' }],
    }
    expect(verifyRealtimeAccessToken(tokenFor(claims), secret)).toEqual(claims)
    expect(() => verifyRealtimeAccessToken(`${tokenFor(claims)}x`, secret)).toThrow()
    expect(() => verifyRealtimeAccessToken(tokenFor({
      ...claims,
      exp: Math.floor(Date.now() / 1000) - 1,
    }), secret)).toThrow('Invalid access token claims')
  })

  it('disconnects sockets without verified claims', () => {
    delete mockSocket.data.claims
    gateway.handleConnection(mockSocket)
    expect(mockSocket.disconnect).toHaveBeenCalledWith(true)
  })

  it('joins and leaves only a workspace in the authenticated claims', () => {
    const joinRes = gateway.handleJoinWorkspace(mockSocket, { workspaceId: 'ws-1' })
    expect(joinRes.status).toBe('joined')
    expect(mockSocket.join).toHaveBeenCalledWith('workspace:ws-1')

    expect(gateway.handleJoinWorkspace(mockSocket, { workspaceId: 'ws-2' }).status).toBe('denied')
    expect(mockSocket.join).toHaveBeenCalledTimes(1)

    const leaveRes = gateway.handleLeaveWorkspace(mockSocket, { workspaceId: 'ws-1' })
    expect(leaveRes.status).toBe('left')
    expect(mockSocket.leave).toHaveBeenCalledWith('workspace:ws-1')
  })

  it('uses workspace-qualified document rooms for join and updates', () => {
    const joinRes = gateway.handleJoinDocument(mockSocket, {
      documentId: 'doc-1',
      workspaceId: 'ws-1',
    })
    expect(joinRes.status).toBe('joined')
    expect(mockSocket.join).toHaveBeenCalledWith('doc:ws-1:doc-1')

    const denied = gateway.handleJoinDocument(mockSocket, {
      documentId: 'doc-2',
      workspaceId: 'ws-2',
    })
    expect(denied.status).toBe('denied')

    const changed = gateway.handleDocChange(mockSocket, {
      documentId: 'doc-1',
      workspaceId: 'ws-1',
      delta: 'update',
    })
    expect(changed.received).toBe(true)
    expect(mockSocket.to).toHaveBeenCalledWith('doc:ws-1:doc-1')
    expect(mockSocket.emit).not.toHaveBeenCalledWith('server:event', expect.anything())
  })

  it('handles chat messages and broadcasts only to the authorized workspace', () => {
    const res = gateway.handleChatMessage(mockSocket, {
      workspaceId: 'ws-1',
      message: 'Hello team!',
      author: 'untrusted author',
    })
    if (!('message' in res)) throw new Error('Expected authorized chat message response')
    expect(res.message).toBe('Hello team!')
    expect(res.author).toBe('user-1')
    expect(mockServer.to).toHaveBeenCalledWith('workspace:ws-1')
    expect(roomEmitter.emit).toHaveBeenCalledWith('chat:received', expect.objectContaining({ author: 'user-1' }))
    expect(mockServer.emit).not.toHaveBeenCalled()
  })
})
