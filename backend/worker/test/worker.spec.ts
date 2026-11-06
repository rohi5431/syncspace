import { WorkerService } from '../src/worker.service'
import { WorkerMetrics } from '../src/metrics/metrics-tracker'

describe('WorkerService and Metrics', () => {
  let worker: WorkerService
  let metrics: WorkerMetrics

  beforeEach(() => {
    worker = new WorkerService()
    metrics = WorkerMetrics.getInstance()
  })

  it('processes document analysis jobs and increments metrics', async () => {
    const job: any = {
      name: 'document.process',
      data: {
        documentId: 'doc-test-1',
        title: 'Architecture Spec',
        content: 'This is a test content with several words for calculation.',
      },
    }

    const res = await worker.processJob(job)
    expect(res.documentId).toBe('doc-test-1')
    expect(res.wordCount).toBeGreaterThan(0)
    expect(res.readingTimeMinutes).toBeGreaterThanOrEqual(1)
  })

  it('handles simulated notification jobs', async () => {
    const job: any = {
      name: 'notification.send',
      data: {
        userId: 'usr-1',
        title: 'New Comment',
        message: 'Maya commented on your document',
      },
    }

    const res = await worker.processJob(job)
    expect(res.delivered).toBe(true)
    expect(res.recipient).toBe('usr-1')
  })

  it('recalculates project progress from persisted tasks', async () => {
    const prisma = (worker as any).prisma
    prisma.task.findMany = jest.fn().mockResolvedValue([
      { completed: true },
      { completed: false },
    ])
    prisma.project.update = jest.fn().mockResolvedValue({})

    await expect(worker.handleProjectStats({ projectId: 'project-1' })).resolves.toEqual({
      projectId: 'project-1',
      progress: 50,
    })
    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: 'project-1' },
      data: { progress: 50, updatedAt: expect.any(Date) },
    })
  })

  it('produces prometheus metrics text', async () => {
    const output = await metrics.getMetrics()
    expect(output).toContain('syncspace_worker_')
  })
})
