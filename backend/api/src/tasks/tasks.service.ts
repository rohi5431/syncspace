import { randomUUID } from 'node:crypto'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { JobsService } from '../jobs/jobs.service'
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto'

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jobs: JobsService,
  ) {}

  async findByProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, workspace: { isSuspended: false, members: { some: { userId } } } },
      select: { id: true },
    })
    if (!project) throw new NotFoundException('Project not found')
    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(projectId: string, dto: CreateTaskDto, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, workspace: { isSuspended: false, members: { some: { userId } } } },
      select: { id: true, workspaceId: true },
    })
    if (!project) throw new NotFoundException('Project not found')
    await this.requireAdmin(project.workspaceId, userId)
    if (dto.assignedTo) await this.requireAssignee(project.workspaceId, dto.assignedTo)

    const task = await this.prisma.task.create({
      data: {
        id: randomUUID(),
        projectId,
        title: dto.title,
        dueDate: dto.dueDate || null,
        assignedTo: dto.assignedTo || null,
        priority: dto.priority ?? 'MEDIUM',
      },
    })
    await this.redis.publish('syncspace:events', {
      type: 'task:created',
      payload: { ...task, workspaceId: project.workspaceId },
    })
    await this.jobs.dispatchProjectStats(projectId)
    return task
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const existing = await this.prisma.task.findFirst({
      where: { id, project: { workspace: { isSuspended: false, members: { some: { userId } } } } },
      include: { project: { select: { workspaceId: true } } },
    })
    if (!existing) throw new NotFoundException('Task not found')

    const role = await this.requireMembership(existing.project.workspaceId, userId)
    if (
      role !== 'OWNER' &&
      role !== 'ADMIN' &&
      (existing.assignedTo !== userId || Object.keys(dto).some((key) => key !== 'completed'))
    ) {
      throw new ForbiddenException('You can only update completion on tasks assigned to you')
    }
    if (dto.assignedTo !== undefined) {
      if (role !== 'OWNER' && role !== 'ADMIN') {
        throw new ForbiddenException('Workspace administrator access is required to assign tasks')
      }
      if (dto.assignedTo) await this.requireAssignee(existing.project.workspaceId, dto.assignedTo)
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
    })
    await this.redis.publish('syncspace:events', {
      type: 'task:updated',
      payload: { ...task, workspaceId: existing.project.workspaceId },
    })
    await this.jobs.dispatchProjectStats(task.projectId)
    return task
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.task.findFirst({
      where: { id, project: { workspace: { isSuspended: false, members: { some: { userId } } } } },
      include: { project: { select: { workspaceId: true } } },
    })
    if (!existing) throw new NotFoundException('Task not found')
    await this.requireAdmin(existing.project.workspaceId, userId)

    const task = await this.prisma.task.delete({ where: { id } })
    await this.redis.publish('syncspace:events', {
      type: 'task:deleted',
      payload: { id, projectId: task.projectId, workspaceId: existing.project.workspaceId },
    })
    await this.jobs.dispatchProjectStats(task.projectId)
    return { success: true, id }
  }

  private async requireMembership(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, workspace: { isSuspended: false } },
      select: { role: true },
    })
    if (!membership) throw new NotFoundException('Task not found')
    return membership.role
  }

  private async requireAdmin(workspaceId: string, userId: string) {
    const role = await this.requireMembership(workspaceId, userId)
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new ForbiddenException('Workspace administrator access is required')
    }
  }

  private async requireAssignee(workspaceId: string, assigneeId: string) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: assigneeId, workspace: { isSuspended: false } },
      select: { id: true },
    })
    if (!member) throw new ForbiddenException('Task assignee must belong to this workspace')
  }
}
