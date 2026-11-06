import { Worker, Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'
import { WorkerMetrics } from './metrics/metrics-tracker'

export class WorkerService {
  private worker: Worker | null = null
  private prisma: PrismaClient
  private redis: Redis | null = null
  private metrics = WorkerMetrics.getInstance()
  private isRunning = false

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://syncspace:syncspace@localhost:5432/syncspace',
        },
      },
    })
  }

  async start(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    try {
      const url = new URL(redisUrl)
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      })
      await this.redis.connect().catch(() => {
        console.warn('Worker Redis publisher offline')
      })

      this.worker = new Worker(
        'syncspace-jobs',
        async (job: Job) => {
          return this.processJob(job)
        },
        {
          connection: {
            host: url.hostname || 'localhost',
            port: Number(url.port) || 6379,
            password: url.password || undefined,
            lazyConnect: true,
            maxRetriesPerRequest: 1,
          },
          concurrency: 5,
        },
      )

      this.worker.on('completed', (job: Job) => {
        console.log(`Job ${job.name} (id: ${job.id}) completed successfully`)
      })

      this.worker.on('failed', (job: Job | undefined, err: Error) => {
        console.warn(`Job ${job?.name || 'unknown'} failed: ${err.message}`)
      })

      this.isRunning = true
      console.log('BullMQ Worker listening on queue "syncspace-jobs"')
    } catch (err: any) {
      console.warn(`BullMQ worker initialization failed: ${err.message}`)
    }
  }

  async processJob(job: Job): Promise<any> {
    const start = Date.now()
    const jobName = job.name
    try {
      let result: any = null
      switch (jobName) {
        case 'document.process':
          result = await this.handleDocumentProcess(job.data)
          break
        case 'project.update-stats':
          result = await this.handleProjectStats(job.data)
          break
        case 'notification.send':
          result = await this.handleNotification(job.data)
          break
        case 'activity.record':
          result = await this.handleActivityRecord(job.data)
          break
        default:
          console.log(`Unknown job type: ${jobName}`)
          result = { skipped: true }
      }

      this.metrics.jobsProcessedTotal.inc({ jobName })
      this.metrics.jobDuration.observe({ jobName }, (Date.now() - start) / 1000)
      return result
    } catch (err: any) {
      this.metrics.jobsFailedTotal.inc({ jobName })
      throw err
    }
  }

  async handleDocumentProcess(data: { documentId: string; title: string; content?: string }) {
    console.log(`Processing document ${data.documentId}: "${data.title}"`)
    const wordCount = (data.content || '').split(/\s+/).filter(Boolean).length
    const readingTimeMinutes = Math.ceil(wordCount / 200)

    try {
      await this.prisma.document.update({
        where: { id: data.documentId },
        data: {
          updatedAt: new Date(),
        },
      })
    } catch {
      // Ignored if document table is not reached in mock mode
    }

    return { documentId: data.documentId, wordCount, readingTimeMinutes }
  }

  async handleProjectStats(data: { projectId: string }) {
    console.log(`Calculating stats for project ${data.projectId}`)
    const tasks = await this.prisma.task.findMany({
      where: { projectId: data.projectId },
    })
    const completed = tasks.filter((task) => task.completed).length
    const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
    await this.prisma.project.update({
      where: { id: data.projectId },
      data: { progress, updatedAt: new Date() },
    })

    if (this.redis) {
      await this.redis.publish(
        'syncspace:events',
        JSON.stringify({
          type: 'project:stats_updated',
          payload: { projectId: data.projectId, progress },
        }),
      )
    }

    return { projectId: data.projectId, progress }
  }

  async handleNotification(data: { userId: string; title: string; message: string }) {
    console.log(`Simulated sending notification to user ${data.userId}: ${data.title}`)
    return { delivered: true, recipient: data.userId }
  }

  async handleActivityRecord(data: any) {
    console.log(`Recorded worker activity:`, data)
    return { recorded: true }
  }

  isHealthy(): boolean {
    return this.isRunning
  }

  async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.close()
    }
    if (this.redis) {
      this.redis.disconnect()
    }
    await this.prisma.$disconnect()
  }
}
