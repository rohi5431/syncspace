import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { TasksService } from '../src/tasks/tasks.service'

describe('TasksService tenant access', () => {
  let service: TasksService
  let prisma: any
  let redis: any
  let jobs: any

  beforeEach(() => {
    prisma = {
      project: { findFirst: jest.fn() },
      workspaceMember: { findFirst: jest.fn() },
      task: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }
    redis = { publish: jest.fn().mockResolvedValue(1) }
    jobs = { dispatchProjectStats: jest.fn() }
    service = new TasksService(prisma, redis, jobs)
  })

  it('does not expose tasks when the caller is outside the project workspace', async () => {
    prisma.project.findFirst.mockResolvedValue(null)

    await expect(service.findByProject('project-other-tenant', 'user-1')).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.project.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: 'project-other-tenant',
        workspace: { members: { some: { userId: 'user-1' } } },
      }),
    }))
    expect(prisma.task.findMany).not.toHaveBeenCalled()
  })

  it('rejects assignments to users outside the project workspace', async () => {
    prisma.project.findFirst.mockResolvedValue({ id: 'project-1', workspaceId: 'workspace-1' })
    prisma.workspaceMember.findFirst
      .mockResolvedValueOnce({ role: 'ADMIN' })
      .mockResolvedValueOnce(null)

    await expect(service.create('project-1', {
      title: 'Cross-tenant assignment',
      assignedTo: 'user-other-tenant',
    }, 'admin-1')).rejects.toBeInstanceOf(ForbiddenException)
    expect(prisma.task.create).not.toHaveBeenCalled()
  })

  it('creates an assigned task for a member of the same workspace', async () => {
    const task = { id: 'task-1', projectId: 'project-1', assignedTo: 'member-1' }
    prisma.project.findFirst.mockResolvedValue({ id: 'project-1', workspaceId: 'workspace-1' })
    prisma.workspaceMember.findFirst
      .mockResolvedValueOnce({ role: 'ADMIN' })
      .mockResolvedValueOnce({ id: 'membership-1' })
    prisma.task.create.mockResolvedValue(task)

    await expect(service.create('project-1', {
      title: 'Tenant-safe assignment',
      assignedTo: 'member-1',
    }, 'admin-1')).resolves.toBe(task)
    expect(prisma.task.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ assignedTo: 'member-1' }),
    }))
  })
})
