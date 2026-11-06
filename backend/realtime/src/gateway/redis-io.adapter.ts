import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import Redis from 'ioredis'
import { Logger } from '@nestjs/common'

export class RedisIoAdapter extends IoAdapter {
  private readonly redisLogger = new Logger(RedisIoAdapter.name)
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null

  async connectToRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    try {
      const pubClient = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      })
      const subClient = pubClient.duplicate()

      await Promise.all([pubClient.connect(), subClient.connect()])
      this.adapterConstructor = createAdapter(pubClient, subClient)
      this.redisLogger.log('Connected Socket.IO to Redis adapter')
    } catch (err: any) {
      this.redisLogger.warn(`Redis adapter unavailable, using in-memory socket adapter: ${err.message}`)
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: { origin: '*', methods: ['GET', 'POST'] },
    })
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor)
    }
    return server
  }
}
