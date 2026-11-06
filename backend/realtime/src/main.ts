import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import * as dotenv from 'dotenv'
import { AppModule } from './app.module'
import { RedisIoAdapter } from './gateway/redis-io.adapter'

dotenv.config()

async function bootstrap() {
  const logger = new Logger('SyncSpaceRealtime')
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  })

  const redisIoAdapter = new RedisIoAdapter(app)
  await redisIoAdapter.connectToRedis()
  app.useWebSocketAdapter(redisIoAdapter)

  const port = process.env.PORT || 3002
  await app.listen(port, '0.0.0.0')
  logger.log(`SyncSpace Realtime Gateway listening on http://0.0.0.0:${port}`)
}

bootstrap().catch((err) => {
  console.error('Fatal Realtime bootstrap error:', err)
  process.exit(1)
})
