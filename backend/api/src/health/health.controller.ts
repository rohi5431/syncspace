import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  check() {
    return {
      status: 'ok',
      service: 'syncspace-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  }

  @Get('live')
  live() {
    return { status: 'ok' }
  }

  @Get('ready')
  ready() {
    const dbHealthy = this.prisma.isHealthy()
    const redisHealthy = this.redis.isHealthy()

    return {
      status: 'ok',
      checks: {
        database: dbHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down',
      },
    }
  }
}
