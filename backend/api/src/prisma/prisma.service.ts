import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)
  private isConnected = false

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://syncspace:syncspace@localhost:5432/syncspace',
        },
      },
    })
  }

  async onModuleInit() {
    try {
      await this.$connect()
      this.isConnected = true
      this.logger.log('Prisma connected to PostgreSQL')
    } catch (err: any) {
      this.isConnected = false
      this.logger.warn(`Prisma could not connect to database on init: ${err.message}`)
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect()
    } catch (err: any) {
      this.logger.warn(`Error disconnecting Prisma: ${err.message}`)
    }
  }

  isHealthy(): boolean {
    return this.isConnected
  }
}
