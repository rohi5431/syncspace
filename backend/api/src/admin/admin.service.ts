import { randomUUID } from 'node:crypto'
import { Prisma } from '@prisma/client'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { MetricsService } from '../metrics/metrics.service'
import { JobsService } from '../jobs/jobs.service'
import { StorageService } from '../storage/storage.service'

export type AdminActor = {
  id: string
  email: string
  ipAddress?: string
  requestId?: string
}

type AdminRange = '24h' | '7d' | '30d' | '90d'

const RANGE_DAYS: Record<AdminRange, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly metrics: MetricsService,
    private readonly jobs: JobsService,
    private readonly storage: StorageService,
  ) {}

  async getOverview(rangeInput = '30d') {
    const range = this.parseRange(rangeInput)
    const start = new Date(Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000)
    const [
      users,
      activeUsers,
      suspendedUsers,
      organizations,
      activeOrganizations,
      projects,
      documents,
      tasks,
      completedTasks,
      newUsers,
      newOrganizations,
      registrationGrowth,
      organizationGrowth,
      projectGrowth,
      taskGrowth,
      documentGrowth,
      activeUserTrend,
      organizationActivity,
      recentActivity,
      api,
      database,
      redis,
      realtime,
      worker,
      queue,
      storage,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isSuspended: false } }),
      this.prisma.user.count({ where: { isSuspended: true } }),
      this.prisma.workspace.count(),
      this.prisma.workspace.count({ where: { isSuspended: false } }),
      this.prisma.project.count(),
      this.prisma.document.count(),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { completed: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: start } } }),
      this.prisma.workspace.count({ where: { createdAt: { gte: start } } }),
      this.getTimeSeries('users', range),
      this.getTimeSeries('workspaces', range),
      this.getTimeSeries('projects', range),
      this.getTimeSeries('tasks', range),
      this.getTimeSeries('documents', range),
      this.getLoginTimeSeries(start, range),
      this.getOrganizationActivity(start),
      this.getRecentPlatformActivity(),
      this.metrics.getAdminSnapshot(),
      this.getDatabaseSnapshot(),
      this.getRedisSnapshot(),
      this.getExternalServiceSnapshot(
        process.env.REALTIME_HEALTH_URL || 'http://127.0.0.1:3002/health/ready',
        'syncspace_realtime_connected_clients',
      ),
      this.getExternalServiceSnapshot(
        process.env.WORKER_HEALTH_URL || 'http://127.0.0.1:3004/health/ready',
        'syncspace_worker_jobs_processed_total',
      ),
      this.jobs.getQueueSnapshot(),
      this.storage.getAdminStorageSnapshot(),
    ])

    return {
      range,
      analytics: {
        users,
        activeUsers,
        suspendedUsers,
        organizations,
        activeOrganizations,
        workspaces: organizations,
        projects,
        documents,
        tasks,
        completedTasks,
        storageBytes: storage.totalBytes,
        newUsersInRange: newUsers,
        newOrganizationsInRange: newOrganizations,
        registrationGrowth,
        organizationGrowth,
        projectGrowth,
        taskGrowth,
        documentGrowth,
        activeUserTrend,
        organizationActivity,
        recentActivity,
      },
      monitoring: {
        api: { status: 'healthy', ...api },
        database,
        redis,
        websocket: { ...realtime, connections: realtime.metric },
        worker: {
          ...worker,
          processedJobs: worker.metric,
          queue,
        },
        mongo: storage,
        infrastructure: {
          processMemoryBytes: process.memoryUsage(),
          cpuUserMicroseconds: process.cpuUsage().user,
          cpuSystemMicroseconds: process.cpuUsage().system,
          diskUsageBytes: null,
          networkTrafficBytes: null,
        },
        checkedAt: new Date().toISOString(),
      },
    }
  }

  async getUsers(options: Record<string, string | undefined> = {}) {
    const { page, pageSize, skip } = this.pagination(options)
    const where: Prisma.UserWhereInput = {}
    if (options.search?.trim()) {
      const search = options.search.trim()
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (options.status === 'active') where.isSuspended = false
    if (options.status === 'suspended') where.isSuspended = true
    if (options.from || options.to) where.createdAt = this.dateFilter(options.from, options.to)
    if (options.workspaceId) {
      where.memberships = { some: { workspaceId: options.workspaceId } }
    }

    const orderBy = this.sortOrder(options.sort, ['createdAt', 'name', 'email'])
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          initials: true,
          role: true,
          platformRole: true,
          isSuspended: true,
          emailVerifiedAt: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { memberships: true, tokens: { where: { revoked: false, expiresAt: { gt: new Date() } } } } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ])
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        initials: true,
        role: true,
        platformRole: true,
        isSuspended: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        memberships: {
          select: {
            role: true,
            joinedAt: true,
            workspace: { select: { id: true, name: true, slug: true, isSuspended: true } },
          },
        },
        tokens: {
          where: { revoked: false, expiresAt: { gt: new Date() } },
          select: { id: true, createdAt: true, expiresAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!user) throw new NotFoundException('User not found')
    const recentActivity = await this.prisma.adminAuditLog.findMany({
      where: { actorId: userId },
      select: {
        id: true,
        action: true,
        resourceType: true,
        resourceId: true,
        success: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    return { ...user, recentActivity }
  }

  async getWorkspaces(options: Record<string, string | undefined> = {}) {
    const { page, pageSize, skip } = this.pagination(options)
    const where: Prisma.WorkspaceWhereInput = {}
    if (options.search?.trim()) {
      const search = options.search.trim()
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { members: { some: { role: 'OWNER', user: { email: { contains: search, mode: 'insensitive' } } } } },
      ]
    }
    if (options.status === 'active') where.isSuspended = false
    if (options.status === 'suspended') where.isSuspended = true
    if (options.from || options.to) where.createdAt = this.dateFilter(options.from, options.to)

    const orderBy = this.sortOrder(options.sort, ['createdAt', 'name', 'slug'])
    const [items, total] = await Promise.all([
      this.prisma.workspace.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          isSuspended: true,
          members: {
            where: { role: 'OWNER' },
            take: 1,
            select: { user: { select: { id: true, name: true, email: true } } },
          },
          _count: { select: { members: true, projects: true, documents: true } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.workspace.count({ where }),
    ])
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  }

  async getWorkspaceDetails(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        isSuspended: true,
        members: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            user: { select: { id: true, name: true, email: true, isSuspended: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
        projects: {
          select: { id: true, title: true, progress: true, createdAt: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 50,
        },
        _count: { select: { members: true, projects: true, documents: true, folders: true, activities: true } },
      },
    })
    if (!workspace) throw new NotFoundException('Organization not found')
    const activity = await this.prisma.activity.findMany({
      where: { workspaceId },
      select: { id: true, name: true, action: true, target: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    const resourceUsage = await this.getWorkspaceStorage(workspaceId)
    return { ...workspace, activity, resourceUsage }
  }

  async setUserSuspension(userId: string, suspended: boolean, actor: AdminActor) {
    const updated = await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, isSuspended: true, platformRole: true },
      })
      if (!user) throw new NotFoundException('User not found')
      if (user.isSuspended === suspended) {
        return { id: user.id, email: user.email, isSuspended: user.isSuspended, changed: false }
      }
      if (suspended && user.platformRole === 'ADMIN') {
        const activeAdmins = await transaction.user.count({
          where: { platformRole: 'ADMIN', isSuspended: false },
        })
        if (activeAdmins <= 1) {
          throw new BadRequestException('The last active platform administrator cannot be suspended')
        }
      }

      const result = await transaction.user.update({
        where: { id: userId },
        data: { isSuspended: suspended },
        select: { id: true, email: true, isSuspended: true },
      })
      if (suspended) {
        await transaction.refreshToken.updateMany({
          where: { userId, revoked: false },
          data: { revoked: true },
        })
      }
      await transaction.adminAuditLog.create({
        data: {
          id: randomUUID(),
          actorId: actor.id,
          actorEmail: actor.email,
          action: suspended ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
          resourceType: 'user',
          resourceId: userId,
          requestId: actor.requestId,
          ipAddress: actor.ipAddress,
          success: true,
          metadata: { before: { isSuspended: user.isSuspended }, after: { isSuspended: suspended } },
        },
      })
      return { ...result, changed: true }
    }, { isolationLevel: 'Serializable' })

    if (updated.changed && suspended) {
      await this.redis.publish('syncspace:events', {
        type: 'platform:user-suspended',
        payload: { userId },
      })
    }
    const { changed: _changed, ...result } = updated
    return result
  }

  async revokeUserSessions(userId: string, actor: AdminActor) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    })
    if (!user) throw new NotFoundException('User not found')
    const revoked = await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    })
    await this.writeAudit(actor, 'USER_SESSIONS_REVOKED', 'user', userId, {
      revokedSessionCount: revoked.count,
    })
    await this.redis.publish('syncspace:events', {
      type: 'platform:user-sessions-revoked',
      payload: { userId },
    })
    return { userId, revokedSessionCount: revoked.count }
  }

  async setWorkspaceSuspension(workspaceId: string, suspended: boolean, actor: AdminActor) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true, isSuspended: true },
    })
    if (!workspace) throw new NotFoundException('Organization not found')
    if (workspace.isSuspended === suspended) {
      return { id: workspace.id, isSuspended: workspace.isSuspended }
    }
    const updated = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { isSuspended: suspended },
      select: { id: true, isSuspended: true },
    })
    await this.writeAudit(
      actor,
      suspended ? 'ORGANIZATION_SUSPENDED' : 'ORGANIZATION_REACTIVATED',
      'organization',
      workspaceId,
      { before: { isSuspended: workspace.isSuspended }, after: { isSuspended: suspended } },
    )
    await this.redis.publish('syncspace:events', {
      type: 'platform:workspace-suspension-changed',
      payload: { workspaceId, suspended },
    })
    return updated
  }

  async getAuditLogs(options: Record<string, string | undefined> = {}) {
    const { page, pageSize, skip } = this.pagination(options)
    const where: Prisma.AdminAuditLogWhereInput = {}
    if (options.search?.trim()) {
      const search = options.search.trim()
      where.OR = [
        { actorEmail: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { resourceType: { contains: search, mode: 'insensitive' } },
        { resourceId: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (options.actorId) where.actorId = options.actorId
    if (options.action) where.action = { contains: options.action, mode: 'insensitive' }
    if (options.resourceType) where.resourceType = options.resourceType
    if (options.from || options.to) where.createdAt = this.dateFilter(options.from, options.to)
    const [items, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.adminAuditLog.count({ where }),
    ])
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  }

  private parseRange(input: string): AdminRange {
    if (input === '24h' || input === '7d' || input === '30d' || input === '90d') return input
    throw new BadRequestException('range must be one of 24h, 7d, 30d, or 90d')
  }

  private pagination(options: Record<string, string | undefined>) {
    const page = Math.max(1, Number.parseInt(options.page || '1', 10) || 1)
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(options.pageSize || '25', 10) || 25))
    return { page, pageSize, skip: (page - 1) * pageSize }
  }

  private sortOrder<T extends object>(input: string | undefined, fields: string[]): T {
    const [field, direction] = (input || 'createdAt:desc').split(':')
    if (!fields.includes(field) || (direction !== 'asc' && direction !== 'desc')) {
      throw new BadRequestException(`sort must use an allowed field and asc or desc: ${fields.join(', ')}`)
    }
    return { [field]: direction } as T
  }

  private dateFilter(from?: string, to?: string) {
    const filter: Prisma.DateTimeFilter = {}
    if (from) {
      const date = new Date(from)
      if (Number.isNaN(date.getTime())) throw new BadRequestException('from must be a valid date')
      filter.gte = date
    }
    if (to) {
      const date = new Date(to)
      if (Number.isNaN(date.getTime())) throw new BadRequestException('to must be a valid date')
      filter.lte = date
    }
    if (filter.gte && filter.lte && filter.gte > filter.lte) {
      throw new BadRequestException('from must be earlier than to')
    }
    return filter
  }

  private async getTimeSeries(table: 'users' | 'workspaces' | 'projects' | 'tasks' | 'documents', range: AdminRange) {
    const isHourly = range === '24h'
    const intervalCount = isHourly ? 24 : RANGE_DAYS[range]
    const unit = isHourly ? 'hour' : 'day'
    const now = new Date()
    const start = new Date(now.getTime() - (intervalCount - 1) * (isHourly ? 60 : 1440) * 60 * 1000)
    const queryTable = Prisma.raw(`"${table}"`)
    const rows = await this.prisma.$queryRaw<Array<{ bucket: Date; count: bigint | number }>>(
      Prisma.sql`SELECT date_trunc(${unit}, "createdAt") AS bucket, COUNT(*)::int AS count
        FROM ${queryTable}
        WHERE "createdAt" >= ${start}
        GROUP BY bucket
        ORDER BY bucket`,
    )
    const counts = new Map(rows.map((row) => [new Date(row.bucket).toISOString().slice(0, isHourly ? 13 : 10), Number(row.count)]))
    return Array.from({ length: intervalCount }, (_, index) => {
      const bucketDate = new Date(start)
      if (isHourly) bucketDate.setUTCHours(bucketDate.getUTCHours() + index, 0, 0, 0)
      else bucketDate.setUTCHours(0, 0, 0, 0), bucketDate.setUTCDate(bucketDate.getUTCDate() + index)
      const key = bucketDate.toISOString().slice(0, isHourly ? 13 : 10)
      return { bucket: key, count: counts.get(key) ?? 0 }
    })
  }

  private async getLoginTimeSeries(start: Date, range: AdminRange) {
    const isHourly = range === '24h'
    const unit = isHourly ? 'hour' : 'day'
    const query = await this.prisma.adminAuditLog.groupBy({
      by: ['createdAt'],
      where: { action: 'USER_LOGIN', success: true, createdAt: { gte: start } },
      _count: { _all: true },
    })
    const counts = new Map<string, number>()
    for (const row of query) {
      const date = new Date(row.createdAt)
      if (unit === 'hour') date.setUTCMinutes(0, 0, 0)
      else date.setUTCHours(0, 0, 0, 0)
      const key = date.toISOString().slice(0, isHourly ? 13 : 10)
      counts.set(key, (counts.get(key) ?? 0) + row._count._all)
    }
    const intervalCount = isHourly ? 24 : RANGE_DAYS[range]
    return Array.from({ length: intervalCount }, (_, index) => {
      const date = new Date(start)
      if (isHourly) date.setUTCHours(date.getUTCHours() + index, 0, 0, 0)
      else date.setUTCHours(0, 0, 0, 0), date.setUTCDate(date.getUTCDate() + index)
      const key = date.toISOString().slice(0, isHourly ? 13 : 10)
      return { bucket: key, count: counts.get(key) ?? 0 }
    })
  }

  private getOrganizationActivity(start: Date) {
    return this.prisma.activity.groupBy({
      by: ['workspaceId'],
      where: { createdAt: { gte: start } },
      _count: { _all: true },
      orderBy: { _count: { workspaceId: 'desc' } },
      take: 10,
    }).then(async (rows) => {
      if (!rows.length) return []
      const workspaces = await this.prisma.workspace.findMany({
        where: { id: { in: rows.map((row) => row.workspaceId) } },
        select: { id: true, name: true },
      })
      const names = new Map(workspaces.map((workspace) => [workspace.id, workspace.name]))
      return rows.map((row) => ({
        workspaceId: row.workspaceId,
        organizationName: names.get(row.workspaceId) ?? 'Unavailable',
        activityCount: row._count._all,
      }))
    })
  }

  private getRecentPlatformActivity() {
    return this.prisma.activity.findMany({
      select: {
        id: true,
        name: true,
        action: true,
        target: true,
        createdAt: true,
        workspace: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })
  }

  private async getDatabaseSnapshot() {
    const started = Date.now()
    try {
      await this.prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS "ok"`
    } catch {
      return {
        status: 'unavailable',
        latencyMs: null,
        activeConnections: null,
        databaseBytes: null,
        lastSuccessfulHealthCheck: null,
      }
    }

    let activeConnections: number | null = null
    let databaseBytes: number | null = null
    try {
      const rows = await this.prisma.$queryRaw<Array<{ activeConnections: number; databaseBytes: bigint }>>`
        SELECT
          (SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = current_database()) AS "activeConnections",
          pg_database_size(current_database()) AS "databaseBytes"
      `
      activeConnections = rows[0]?.activeConnections ?? null
      databaseBytes = rows[0] ? Number(rows[0].databaseBytes) : null
    } catch {
      // PostgreSQL may deny statistics access even when the database is reachable.
    }
    return {
      status: 'healthy',
      latencyMs: Date.now() - started,
      activeConnections,
      databaseBytes,
      lastSuccessfulHealthCheck: new Date().toISOString(),
    }
  }

  private async getRedisSnapshot() {
    const redisClient = this.redis.getClient()
    if (!redisClient) return { status: 'unavailable', latencyMs: null, usedMemoryBytes: null, connectedClients: null }
    const started = Date.now()
    let pong: string
    try {
      pong = await redisClient.ping()
      if (pong !== 'PONG') throw new Error('Redis did not return PONG')
    } catch {
      return {
        status: 'unavailable',
        latencyMs: null,
        usedMemoryBytes: null,
        connectedClients: null,
        lastSuccessfulHealthCheck: null,
      }
    }

    let usedMemoryBytes: number | null = null
    let connectedClients: number | null = null
    try {
      const [memory, clients] = await Promise.all([
        redisClient.info('memory'),
        redisClient.info('clients'),
      ])
      const parseInfo = (info: string, key: string) => {
        const value = info.split('\r\n').find((line) => line.startsWith(`${key}:`))?.split(':')[1]
        return value === undefined ? null : Number(value)
      }
      usedMemoryBytes = parseInfo(memory, 'used_memory')
      connectedClients = parseInfo(clients, 'connected_clients')
    } catch {
      // INFO may be restricted by Redis ACLs; PING still establishes service availability.
    }
    return {
      status: 'healthy',
      latencyMs: Date.now() - started,
      usedMemoryBytes,
      connectedClients,
      lastSuccessfulHealthCheck: new Date().toISOString(),
    }
  }

  private async getExternalServiceSnapshot(url: string, metricName: string) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const started = Date.now()
    try {
      const response = await fetch(url, { signal: controller.signal })
      const body = await response.json() as { status?: string; checks?: Record<string, string> }
      if (!response.ok) return { status: 'unavailable', latencyMs: Date.now() - started, checks: {}, metric: null }
      const checks = body.checks ?? {}
      const status = body.status !== 'ok'
        ? 'degraded'
        : Object.values(checks).some((check) => check !== 'up' && check !== 'healthy' && check !== 'ok')
          ? 'degraded'
          : 'healthy'
      let metric: number | null = null
      try {
        const metricsUrl = new URL('/metrics', url)
        const metricsResponse = await fetch(metricsUrl, { signal: controller.signal })
        if (metricsResponse.ok) {
          const text = await metricsResponse.text()
          const samples = text.split('\n')
            .map((line) => line.match(new RegExp(`^${metricName}(?:\\{[^}]*\\})?\\s+([\\d.eE+-]+)$`)))
            .filter((match): match is RegExpMatchArray => match !== null)
            .map((match) => Number(match[1]))
          if (samples.length) metric = samples.reduce((total, value) => total + value, 0)
        }
      } catch {
        metric = null
      }
      return {
        status,
        latencyMs: Date.now() - started,
        checks,
        metric,
      }
    } catch {
      return { status: 'unavailable', latencyMs: null, checks: {}, metric: null }
    } finally {
      clearTimeout(timeout)
    }
  }

  private async getWorkspaceStorage(workspaceId: string) {
    const snapshot = await this.storage.getAdminStorageSnapshot()
    if (snapshot.totalBytes === null) return { status: snapshot.status, totalBytes: null, fileCount: null }
    const documentIds = await this.prisma.document.findMany({
      where: { workspaceId },
      select: { id: true },
    })
    const ids = documentIds.map((document) => document.id)
    return this.storage.getWorkspaceStorageSnapshot(ids)
  }

  private async writeAudit(
    actor: AdminActor,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Prisma.InputJsonObject,
  ) {
    return this.prisma.adminAuditLog.create({
      data: {
        id: randomUUID(),
        actorId: actor.id,
        actorEmail: actor.email,
        action,
        resourceType,
        resourceId,
        requestId: actor.requestId,
        ipAddress: actor.ipAddress,
        success: true,
        metadata,
      },
    })
  }
}
