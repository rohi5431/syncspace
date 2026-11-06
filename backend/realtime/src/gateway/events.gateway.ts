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
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import Redis from 'ioredis'
import { MetricsService } from '../metrics/metrics.service'

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

      this.subRedis.on('message', (channel, message) => {
        try {
          const parsed = JSON.parse(message)
          if (this.server) {
            this.server.emit('server:event', parsed)
            if (parsed.payload?.workspaceId) {
              this.server.to(`workspace:${parsed.payload.workspaceId}`).emit(parsed.type, parsed.payload)
            }
          }
        } catch {
          // ignore parsing error
        }
      })

      this.subRedis.connect()
        .then(() => {
          this.subRedis?.subscribe('syncspace:events')
          this.logger.log('Subscribed to Redis channel syncspace:events')
        })
        .catch((err) => {
          this.logger.warn(`Could not subscribe to Redis events: ${err.message}`)
        })
    } catch (err: any) {
      this.logger.warn(`Redis subscriber init skipped: ${err.message}`)
    }
  }

  handleConnection(client: Socket) {
    this.metrics.connectedClients.inc()
    this.logger.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.metrics.connectedClients.dec()
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('join_workspace')
  handleJoinWorkspace(@ConnectedSocket() client: Socket, @MessageBody() data: { workspaceId: string }) {
    this.metrics.socketEventsTotal.inc({ event: 'join_workspace' })
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
  handleJoinDocument(@ConnectedSocket() client: Socket, @MessageBody() data: { documentId: string; user?: any }) {
    this.metrics.socketEventsTotal.inc({ event: 'join_document' })
    const room = `doc:${data.documentId}`
    client.join(room)
    client.to(room).emit('document:user_joined', { documentId: data.documentId, user: data.user, socketId: client.id })
    return { status: 'joined', room }
  }

  @SubscribeMessage('leave_document')
  handleLeaveDocument(@ConnectedSocket() client: Socket, @MessageBody() data: { documentId: string; user?: any }) {
    this.metrics.socketEventsTotal.inc({ event: 'leave_document' })
    const room = `doc:${data.documentId}`
    client.leave(room)
    client.to(room).emit('document:user_left', { documentId: data.documentId, user: data.user, socketId: client.id })
    return { status: 'left', room }
  }

  @SubscribeMessage('doc_change')
  handleDocChange(@ConnectedSocket() client: Socket, @MessageBody() data: { documentId: string; delta: any }) {
    this.metrics.socketEventsTotal.inc({ event: 'doc_change' })
    const room = `doc:${data.documentId}`
    client.to(room).emit('document:changed', data)
    return { received: true }
  }

  @SubscribeMessage('presence')
  handlePresence(@ConnectedSocket() client: Socket, @MessageBody() data: { workspaceId: string; user: any; status: string }) {
    this.metrics.socketEventsTotal.inc({ event: 'presence' })
    const room = `workspace:${data.workspaceId}`
    client.to(room).emit('presence:updated', data)
    return { acknowledged: true }
  }

  @SubscribeMessage('chat_message')
  handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { workspaceId: string; message: string; author: string }) {
    this.metrics.socketEventsTotal.inc({ event: 'chat_message' })
    const room = `workspace:${data.workspaceId}`
    const payload = { ...data, timestamp: new Date().toISOString(), id: `msg-${Date.now().toString(36)}` }
    this.server.to(room).emit('chat:received', payload)
    return payload
  }
}
