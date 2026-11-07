import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class JobsService implements OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name)
  private queue: Queue | null = null

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    try {
      const url = new URL(redisUrl)
      this.queue = new Queue('syncspace-jobs', {
        connection: {
          host: url.hostname || 'localhost',
          port: Number(url.port) || 6379,
          password: url.password || undefined,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        },
      })
    } catch (err: any) {
      this.logger.warn(`Could not initialize BullMQ queue: ${err.message}`)
    }
  }

  async dispatchDocumentProcess(documentId: string, title: string, content: string): Promise<void> {
    if (!this.queue) return
    try {
      await this.queue.add('document.process', { documentId, title, content })
      this.logger.log(`Dispatched document.process job for doc ${documentId}`)
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch document.process job: ${err.message}`)
    }
  }

  async dispatchProjectStats(projectId: string): Promise<void> {
    if (!this.queue) return
    try {
      await this.queue.add('project.update-stats', { projectId })
      this.logger.log(`Dispatched project.update-stats job for project ${projectId}`)
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch project.update-stats job: ${err.message}`)
    }
  }

  async dispatchNotification(userId: string, title: string, message: string): Promise<void> {
    if (!this.queue) return
    try {
      await this.queue.add('notification.send', { userId, title, message })
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch notification job: ${err.message}`)
    }
  }

  async getQueueSnapshot() {
    if (!this.queue) return { status: 'unavailable' as const }
    try {
      const [counts, isPaused] = await Promise.all([
        this.queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused'),
        this.queue.isPaused(),
      ])
      return {
        status: 'healthy' as const,
        paused: isPaused,
        waiting: counts.waiting ?? 0,
        active: counts.active ?? 0,
        completed: counts.completed ?? 0,
        failed: counts.failed ?? 0,
        delayed: counts.delayed ?? 0,
        pausedJobs: counts.paused ?? 0,
      }
    } catch (error) {
      this.logger.warn(`Could not read BullMQ queue status: ${error instanceof Error ? error.message : String(error)}`)
      return { status: 'unavailable' as const }
    }
  }

  async onModuleDestroy() {
    if (this.queue) {
      await this.queue.close()
    }
  }
}
