import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import * as dotenv from 'dotenv'
import { AppModule } from './app.module'
import { MetricsService } from './metrics/metrics.service'

dotenv.config()
dotenv.config({ path: '../../.env' })

async function bootstrap() {
  const logger = new Logger('SyncSpaceAPI')
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  )

  const metricsService = app.get(MetricsService)
  app.use((req: any, res: any, next: any) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000
      const route = req.route ? req.route.path : req.path
      const status = String(res.statusCode)
      metricsService.httpRequestsTotal.inc({ method: req.method, route, status })
      metricsService.httpRequestDuration.observe({ method: req.method, route, status }, duration)
    })
    next()
  })

  const port = process.env.PORT || 3001
  await app.listen(port, '0.0.0.0')
  logger.log(`SyncSpace API server listening on http://0.0.0.0:${port}`)
}

bootstrap().catch((err) => {
  console.error('Fatal API bootstrap error:', err)
  process.exit(1)
})
