import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private client: Redis | null = null
  private isConnected = false

  constructor() {
    const url = process.env.REDIS_URL || 'redis://localhost:6379'
    try {
      this.client = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) return null
          return Math.min(times * 100, 1000)
        },
      })

      this.client.on('connect', () => {
        this.isConnected = true
        this.logger.log('Connected to Redis')
      })

      this.client.on('error', (err) => {
        this.isConnected = false
        this.logger.warn(`Redis connection error: ${err.message}`)
      })

      this.client.connect().catch((err) => {
        this.logger.warn(`Failed initial Redis connection: ${err.message}`)
      })
    } catch (err: any) {
      this.logger.warn(`Failed to initialize Redis client: ${err.message}`)
    }
  }

  getClient(): Redis | null {
    return this.client
  }

  isHealthy(): boolean {
    return this.isConnected
  }

  async publish(channel: string, message: any): Promise<void> {
    if (!this.client || !this.isConnected) return
    try {
      const payload = typeof message === 'string' ? message : JSON.stringify(message)
      await this.client.publish(channel, payload)
    } catch (err: any) {
      this.logger.warn(`Failed to publish message to ${channel}: ${err.message}`)
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit()
      } catch {
        this.client.disconnect()
      }
    }
  }
}
