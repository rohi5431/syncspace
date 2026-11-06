import { Controller, Get } from '@nestjs/common'

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'syncspace-realtime',
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
    return {
      status: 'ok',
      checks: {
        websocket: 'up',
      },
    }
  }
}
