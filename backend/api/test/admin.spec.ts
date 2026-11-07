import { BadRequestException, NotFoundException } from '@nestjs/common'
import { AdminService } from '../src/admin/admin.service'
import { PlatformAdminGuard } from '../src/admin/platform-admin.guard'

describe('AdminService', () => {
  let service: AdminService
  let prisma: any
  let redis: any
  let metrics: any
  let jobs: any
  let storage: any

  beforeEach(() => {
    prisma = {
      user: {
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      workspace: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn(), update: jest.fn() },
      refreshToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      project: { count: jest.fn().mockResolvedValue(0) },
      document: { count: jest.fn().mockResolvedValue(0) },
      task: { count: jest.fn().mockResolvedValue(0) },
      adminAuditLog: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      activity: {
        groupBy: jest.fn().mockResolvedValue([]),
        findMany: jest.fn().mockResolvedValue([]),
      },
      isHealthy: jest.fn().mockReturnValue(true),
      $queryRaw: jest.fn().mockResolvedValue([]),
    }
    prisma.$transaction = jest.fn((callback: (transaction: any) => unknown) => callback(prisma))
    redis = {
      isHealthy: jest.fn().mockReturnValue(false),
      getClient: jest.fn().mockReturnValue(null),
      publish: jest.fn().mockResolvedValue(undefined),
    }
    metrics = { getAdminSnapshot: jest.fn().mockResolvedValue({ requestCount: 0 }) }
    jobs = { getQueueSnapshot: jest.fn().mockResolvedValue({ status: 'healthy' }) }
    storage = {
      getAdminStorageSnapshot: jest.fn().mockResolvedValue({
        status: 'unknown',
        totalBytes: null,
        fileCount: null,
      }),
    }
    service = new AdminService(prisma, redis, metrics, jobs, storage)
  })

  describe('PlatformAdminGuard', () => {
    const guard = new PlatformAdminGuard()

    it('rejects users without platform administrator privileges', () => {
      const context = {
        switchToHttp: () => ({ getRequest: () => ({ user: { platformRole: 'USER' } }) }),
      }
      expect(() => guard.canActivate(context as never)).toThrow('Platform administrator access is required')
    })

    it('allows platform administrators', () => {
      const context = {
        switchToHttp: () => ({ getRequest: () => ({ user: { platformRole: 'ADMIN' } }) }),
      }
      expect(guard.canActivate(context as never)).toBe(true)
    })
  })

  it('returns global analytics and live service health', async () => {
    prisma.user.count
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
    prisma.workspace.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
    prisma.project.count.mockResolvedValue(8)
    prisma.document.count.mockResolvedValue(20)
    prisma.task.count
      .mockResolvedValueOnce(36)
      .mockResolvedValueOnce(21)

    const result = await service.getOverview()

    expect(result.analytics).toMatchObject({
      users: 12,
      activeUsers: 10,
      suspendedUsers: 2,
      organizations: 4,
      activeOrganizations: 3,
      projects: 8,
      documents: 20,
      tasks: 36,
      completedTasks: 21,
      newUsersInRange: 3,
      newOrganizationsInRange: 1,
    })
    expect(result.monitoring).toMatchObject({
      api: { status: 'healthy', requestCount: 0 },
      database: { status: 'healthy' },
      redis: { status: 'unavailable' },
    })
  })

  it('reports PostgreSQL reachable when optional statistics are denied', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([{ ok: 1 }])
      .mockRejectedValueOnce(new Error('permission denied for pg_stat_activity'))

    await expect(service['getDatabaseSnapshot']()).resolves.toMatchObject({
      status: 'healthy',
      activeConnections: null,
      databaseBytes: null,
    })
  })

  it('reports PostgreSQL unavailable when its connection probe fails', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('database connection refused'))

    await expect(service['getDatabaseSnapshot']()).resolves.toMatchObject({
      status: 'unavailable',
      latencyMs: null,
    })
  })

  it('reports Redis healthy when PING works but INFO is restricted', async () => {
    redis.getClient.mockReturnValue({
      ping: jest.fn().mockResolvedValue('PONG'),
      info: jest.fn().mockRejectedValue(new Error('NOPERM')),
    })

    await expect(service['getRedisSnapshot']()).resolves.toMatchObject({
      status: 'healthy',
      usedMemoryBytes: null,
      connectedClients: null,
    })
  })

  it('reports Redis unavailable when PING fails', async () => {
    redis.getClient.mockReturnValue({
      ping: jest.fn().mockRejectedValue(new Error('connection refused')),
      info: jest.fn(),
    })

    await expect(service['getRedisSnapshot']()).resolves.toMatchObject({
      status: 'unavailable',
      latencyMs: null,
    })
  })

  it('marks a reachable external service degraded when readiness checks are not ready', async () => {
    const fetchMock = jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: 'ok',
        checks: { worker: 'initializing' },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response('', { status: 404 }))

    try {
      await expect(service['getExternalServiceSnapshot']('http://127.0.0.1:3004/health/ready', 'worker_metric'))
        .resolves.toMatchObject({ status: 'degraded', checks: { worker: 'initializing' } })
    } finally {
      fetchMock.mockRestore()
    }
  })

  it('prevents suspending the last active platform administrator', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      isSuspended: false,
      platformRole: 'ADMIN',
    })
    prisma.user.count.mockResolvedValue(1)

    await expect(service.setUserSuspension('admin-1', true, {
      id: 'actor-1',
      email: 'actor@example.com',
    })).rejects.toBeInstanceOf(BadRequestException)
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('suspends a user and publishes a realtime revocation event', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      isSuspended: false,
      platformRole: 'USER',
    })
    prisma.user.update.mockResolvedValue({ id: 'user-1', isSuspended: true })

    await expect(service.setUserSuspension('user-1', true, {
      id: 'actor-1',
      email: 'actor@example.com',
    })).resolves.toEqual({
      id: 'user-1',
      isSuspended: true,
    })
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revoked: false },
      data: { revoked: true },
    })
    expect(redis.publish).toHaveBeenCalledWith('syncspace:events', {
      type: 'platform:user-suspended',
      payload: { userId: 'user-1' },
    })
  })

  it('returns not found for an unknown account', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    await expect(service.setUserSuspension('missing', true, {
      id: 'actor-1',
      email: 'actor@example.com',
    })).rejects.toBeInstanceOf(NotFoundException)
  })
})
