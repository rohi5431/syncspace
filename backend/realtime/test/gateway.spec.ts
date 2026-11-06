import { EventsGateway } from '../src/gateway/events.gateway'
import { MetricsService } from '../src/metrics/metrics.service'

describe('EventsGateway', () => {
  let gateway: EventsGateway
  let metricsService: MetricsService
  let mockSocket: any
  let mockServer: any

  beforeEach(() => {
    metricsService = new MetricsService()
    gateway = new EventsGateway(metricsService)
    mockSocket = {
      id: 'sock-1',
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    }
    mockServer = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    }
    gateway.server = mockServer
  })

  it('handles client connection and disconnect metrics', () => {
    gateway.handleConnection(mockSocket)
    gateway.handleDisconnect(mockSocket)
  })

  it('joins and leaves workspace room', () => {
    const joinRes = gateway.handleJoinWorkspace(mockSocket, { workspaceId: 'ws-1' })
    expect(joinRes.status).toBe('joined')
    expect(mockSocket.join).toHaveBeenCalledWith('workspace:ws-1')

    const leaveRes = gateway.handleLeaveWorkspace(mockSocket, { workspaceId: 'ws-1' })
    expect(leaveRes.status).toBe('left')
    expect(mockSocket.leave).toHaveBeenCalledWith('workspace:ws-1')
  })

  it('broadcasts doc_change to room', () => {
    const res = gateway.handleDocChange(mockSocket, { documentId: 'doc-1', delta: { text: 'hello' } })
    expect(res.received).toBe(true)
    expect(mockSocket.to).toHaveBeenCalledWith('doc:doc-1')
  })

  it('handles chat messages and broadcasts to workspace', () => {
    const res = gateway.handleChatMessage(mockSocket, {
      workspaceId: 'ws-1',
      message: 'Hello team!',
      author: 'Maya Chen',
    })
    expect(res.message).toBe('Hello team!')
    expect(mockServer.to).toHaveBeenCalledWith('workspace:ws-1')
  })
})
