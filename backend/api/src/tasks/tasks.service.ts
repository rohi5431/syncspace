import { randomUUID } from 'node:crypto'
import { Injectable, NotFoundException } from '@nestjs/common'
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

  async findByProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    })
    if (!project) throw new NotFoundException(`Project ${projectId} was not found`)
    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(projectId: string, dto: CreateTaskDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    })
    if (!project) throw new NotFoundException(`Project ${projectId} was not found`)
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
      payload: task,
    })
    await this.jobs.dispatchProjectStats(projectId)
    return task
  }

  async update(id: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new NotFoundException(`Task ${id} was not found`)
    const task = await this.prisma.task.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
    })
    await this.redis.publish('syncspace:events', {
      type: 'task:updated',
      payload: task,
    })
    await this.jobs.dispatchProjectStats(task.projectId)
    return task
  }

  async remove(id: string) {
    const existing = await this.prisma.task.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new NotFoundException(`Task ${id} was not found`)
    const task = await this.prisma.task.delete({ where: { id } })
    await this.redis.publish('syncspace:events', {
      type: 'task:deleted',
      payload: { id, projectId: task.projectId },
    })
    await this.jobs.dispatchProjectStats(task.projectId)
    return { success: true, id }
  }
}
