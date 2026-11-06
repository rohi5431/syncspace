import * as dotenv from 'dotenv'
import { WorkerService } from './worker.service'
import { startHealthServer } from './health/health-server'

dotenv.config()

async function main() {
  console.log('Starting SyncSpace BullMQ Worker...')
  const workerService = new WorkerService()
  await workerService.start()

  const port = Number(process.env.PORT) || 3004
  const server = startHealthServer(workerService, port)

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down worker gracefully...`)
    server.close()
    await workerService.stop()
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

main().catch((err) => {
  console.error('Fatal worker process error:', err)
  process.exit(1)
})
