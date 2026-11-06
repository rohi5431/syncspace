import { randomUUID } from 'node:crypto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { CreateProjectDto, PROJECT_SECTIONS, UpdateProjectDto } from './dto/project.dto'

interface ProjectActor {
  id?: string
  initials?: string
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(workspaceId?: string) {
    const projects = await this.prisma.project.findMany({
      where: workspaceId ? { workspaceId } : undefined,
      include: { tasks: true, sections: { orderBy: { position: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    })
    return projects.map((project) => ({
      ...project,
      members: JSON.parse(project.members || '[]') as string[],
    }))
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: true,
        sections: { orderBy: { position: 'asc' } },
        documents: { orderBy: { updatedAt: 'desc' } },
      },
    })
    if (!project) throw new NotFoundException(`Project ${id} was not found`)
    return {
      ...project,
      members: JSON.parse(project.members || '[]') as string[],
    }
  }

  async create(dto: CreateProjectDto, user?: ProjectActor) {
    const workspace = dto.workspaceId
      ? await this.prisma.workspace.findUnique({ where: { id: dto.workspaceId } })
      : await this.prisma.workspace.findFirst()
    if (!workspace) throw new NotFoundException('A workspace is required to create a project')

    const members = dto.members ?? (user?.initials ? [user.initials] : [])
    const project = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.project.create({
        data: {
          id: randomUUID(),
          workspaceId: workspace.id,
          title: dto.title,
          description: dto.description ?? '',
          progress: dto.progress ?? 0,
          dueDate: dto.dueDate ?? 'No due date',
          tone: dto.tone ?? 'indigo',
          members: JSON.stringify(members),
          template: dto.template ?? 'web-application-development',
        },
      })

      await transaction.projectSection.createMany({
        data: PROJECT_SECTIONS.map((section, position) => ({
          id: randomUUID(),
          projectId: created.id,
          key: section.key,
          title: section.title,
          position,
        })),
      })

      return transaction.project.findUniqueOrThrow({
        where: { id: created.id },
        include: { tasks: true, sections: { orderBy: { position: 'asc' } } },
      })
    })

    const result = { ...project, members: JSON.parse(project.members || '[]') as string[] }
    await this.redis.publish('syncspace:events', {
      type: 'project:created',
      payload: result,
    })
    return result
  }

  async update(id: string, dto: UpdateProjectDto) {
    const current = await this.prisma.project.findUnique({ where: { id } })
    if (!current) throw new NotFoundException(`Project ${id} was not found`)
    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        members: dto.members ? JSON.stringify(dto.members) : undefined,
        updatedAt: new Date(),
      },
    })
    const result = { ...updated, members: JSON.parse(updated.members || '[]') as string[] }
    await this.redis.publish('syncspace:events', {
      type: 'project:updated',
      payload: result,
    })
    return result
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id }, select: { id: true } })
    if (!project) throw new NotFoundException(`Project ${id} was not found`)
    await this.prisma.project.delete({ where: { id } })
    await this.redis.publish('syncspace:events', {
      type: 'project:deleted',
      payload: { id },
    })
    return { success: true, id }
  }
}
