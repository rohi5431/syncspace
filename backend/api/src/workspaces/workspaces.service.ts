import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateWorkspaceDto, UpdateWorkspaceDto, AddMemberDto } from './dto/workspace.dto'

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId, workspace: { isSuspended: false } },
      include: { workspace: true },
    })
    return memberships.map((membership) => membership.workspace)
  }

  async findOne(idOrSlug: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isSuspended: false,
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, initials: true, tone: true },
            },
          },
        },
        _count: { select: { documents: true, projects: true, members: true } },
      },
    })
    if (!workspace) throw new NotFoundException('Workspace not found')
    return workspace
  }

  async create(dto: CreateWorkspaceDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    if (!user) throw new NotFoundException('User not found')
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Administrator access is required to create a workspace')
    }

    const slug = dto.slug || `${dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`
    return this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug,
        ownerId: userId,
        members: { create: { userId, role: 'OWNER' } },
      },
    })
  }

  async update(id: string, dto: UpdateWorkspaceDto, userId: string) {
    await this.requireAdmin(id, userId)
    const result = await this.prisma.workspace.updateMany({
      where: { id, isSuspended: false, members: { some: { userId } } },
      data: dto,
    })
    if (result.count === 0) throw new NotFoundException('Workspace not found')
    return this.prisma.workspace.findUniqueOrThrow({ where: { id } })
  }

  async getMembers(workspaceId: string, userId: string) {
    await this.requireMembership(workspaceId, userId)
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, initials: true, tone: true } },
      },
    })
  }

  async addMember(workspaceId: string, dto: AddMemberDto, userId: string) {
    const actorRole = await this.requireAdmin(workspaceId, userId)
    const role = dto.role?.toUpperCase() ?? 'MEMBER'
    if (!['ADMIN', 'MEMBER'].includes(role) || (role === 'ADMIN' && actorRole !== 'OWNER')) {
      throw new ForbiddenException('You cannot grant this workspace role')
    }

    const email = dto.email.toLowerCase().trim()
    let user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          initials: email.slice(0, 2).toUpperCase(),
          tone: 'indigo',
          passwordHash: 'invited',
          role: 'MEMBER',
        },
      })
    }

    return this.prisma.workspaceMember.create({
      data: { workspaceId, userId: user.id, role },
    })
  }

  async removeMember(workspaceId: string, memberId: string, userId: string) {
    await this.requireAdmin(workspaceId, userId)
    const target = await this.prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
    })
    if (!target) throw new NotFoundException('Workspace member not found')
    if (target.role === 'OWNER') throw new ForbiddenException('The workspace owner cannot be removed')
    await this.prisma.workspaceMember.delete({ where: { id: memberId } })
    return { success: true }
  }

  private async requireMembership(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, workspace: { isSuspended: false } },
      select: { role: true },
    })
    if (!membership) throw new NotFoundException('Workspace not found')
    return membership.role
  }

  private async requireAdmin(workspaceId: string, userId: string) {
    const role = await this.requireMembership(workspaceId, userId)
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new ForbiddenException('Workspace administrator access is required')
    }
    return role
  }
}
