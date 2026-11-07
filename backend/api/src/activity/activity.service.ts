import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { CreateActivityDto } from './dto/activity.dto'

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(workspaceId: string, limit: number = 20) {
    return this.prisma.activity.findMany({
      where: { workspaceId },
      take: Number(limit) || 20,
      orderBy: { createdAt: 'desc' },
    })
  }

  async record(dto: CreateActivityDto, user?: any) {
    const name = dto.name || user?.name || 'Rohit Kumar'
    const initials = dto.initials || user?.initials || 'RK'
    const tone = dto.tone || user?.tone || 'indigo'
    if (!dto.workspaceId) throw new BadRequestException('workspaceId is required')
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: dto.workspaceId, members: { some: { userId: user?.id } } },
      select: { id: true },
    })
    if (!workspace) throw new NotFoundException('Workspace not found')

    const activity = await this.prisma.activity.create({
      data: {
        workspaceId: workspace.id,
        userId: user?.id || null,
        name,
        initials,
        tone,
        action: dto.action,
        target: dto.target,
      },
    })

    await this.redis.publish('syncspace:events', {
      type: 'activity:created',
      payload: { ...activity, workspaceId: workspace.id },
    })

    return activity
  }
}
