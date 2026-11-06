import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { CreateActivityDto } from './dto/activity.dto'

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(workspaceId?: string, limit: number = 20) {
    try {
      const where: any = {}
      if (workspaceId) where.workspaceId = workspaceId

      const activities = await this.prisma.activity.findMany({
        where,
        take: Number(limit) || 20,
        orderBy: { createdAt: 'desc' },
      })
      if (activities.length > 0) return activities
    } catch (err: any) {
      this.logger.warn(`Database fallback in findAll activities: ${err.message}`)
    }

    // Default mock activities matching lib/demo-data.ts
    return [
      {
        id: 'act-1',
        name: 'Maya Chen',
        initials: 'MC',
        tone: 'indigo',
        action: 'updated',
        target: 'Product roadmap — Q4 2026',
        createdAt: new Date(Date.now() - 24 * 60 * 1000),
      },
      {
        id: 'act-2',
        name: 'Jordan Lee',
        initials: 'JL',
        tone: 'emerald',
        action: 'completed a task in',
        target: 'Website refresh',
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        id: 'act-3',
        name: 'Aisha Shah',
        initials: 'AS',
        tone: 'amber',
        action: 'commented on',
        target: 'Launch campaign brief',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ]
  }

  async record(dto: CreateActivityDto, user?: any) {
    const name = dto.name || user?.name || 'Rohit Kumar'
    const initials = dto.initials || user?.initials || 'RK'
    const tone = dto.tone || user?.tone || 'indigo'

    let activity: any = null
    try {
      const workspace = await this.prisma.workspace.findFirst()
      const workspaceId = dto.workspaceId || workspace?.id || 'ws-northstar'

      activity = await this.prisma.activity.create({
        data: {
          workspaceId,
          userId: user?.id || null,
          name,
          initials,
          tone,
          action: dto.action,
          target: dto.target,
        },
      })
    } catch (err: any) {
      this.logger.warn(`Database fallback in record activity: ${err.message}`)
      activity = {
        id: `act-${Date.now().toString(36)}`,
        name,
        initials,
        tone,
        action: dto.action,
        target: dto.target,
        createdAt: new Date(),
      }
    }

    await this.redis.publish('syncspace:events', {
      type: 'activity:created',
      payload: activity,
    })

    return activity
  }
}
