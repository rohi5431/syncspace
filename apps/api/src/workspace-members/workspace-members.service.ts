import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import type { PaginatedResult, WorkspaceMemberSummary, WorkspaceRole } from '@syncspace/contracts'
import { UsersService } from '../users/users.service'
import { WorkspacesService } from '../workspaces/workspaces.service'
import type { AddWorkspaceMemberDto, UpdateWorkspaceMemberDto, WorkspaceMembersQueryDto } from './workspace-members.dto'
import { WorkspaceMembersRepository } from './workspace-members.repository'

@Injectable()
export class WorkspaceMembersService {
  constructor(
    private readonly repository: WorkspaceMembersRepository,
    private readonly workspaces: WorkspacesService,
    private readonly users: UsersService,
  ) {}

  async list(workspaceId: string, userId: string, query: WorkspaceMembersQueryDto): Promise<PaginatedResult<WorkspaceMemberSummary>> {
    await this.requireMembership(workspaceId, userId)
    return this.repository.list(workspaceId, query.page, query.pageSize)
  }

  async add(workspaceId: string, actorId: string, input: AddWorkspaceMemberDto): Promise<WorkspaceMemberSummary> {
    const actorRole = await this.requireMembership(workspaceId, actorId)
    this.requireManager(actorRole)
    const user = await this.users.findByEmail(input.email.toLowerCase())
    if (!user) throw new NotFoundException('No account exists for that email address yet.')
    if (await this.repository.findByWorkspaceUser(workspaceId, user.id)) {
      throw new ConflictException('That user is already a member of this workspace.')
    }

    try {
      const membership = await this.repository.add({
        workspaceId,
        userId: user.id,
        actorId,
        role: 'MEMBER',
      })
      if (!membership) throw new NotFoundException('Workspace member could not be loaded.')
      return membership
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('That user is already a member of this workspace.')
      throw error
    }
  }

  async updateRole(workspaceId: string, memberId: string, actorId: string, input: UpdateWorkspaceMemberDto) {
    const actorRole = await this.requireMembership(workspaceId, actorId)
    this.requireManager(actorRole)
    const target = await this.repository.findById(workspaceId, memberId)
    if (!target) throw new NotFoundException('Workspace member not found.')
    if (target.role === 'OWNER') throw new ForbiddenException('The workspace owner role cannot be changed.')
    if (actorRole === 'ADMIN' && (target.role === 'ADMIN' || input.role === 'ADMIN')) {
      throw new ForbiddenException('Only the workspace owner can manage administrator roles.')
    }

    const updated = await this.repository.updateRole({ workspaceId, memberId, actorId, role: input.role })
    if (!updated) throw new NotFoundException('Workspace member not found.')
    return updated
  }

  async remove(workspaceId: string, memberId: string, actorId: string) {
    const actorRole = await this.requireMembership(workspaceId, actorId)
    const target = await this.repository.findById(workspaceId, memberId)
    if (!target) throw new NotFoundException('Workspace member not found.')
    if (target.role === 'OWNER') throw new ForbiddenException('The workspace owner cannot be removed.')

    if (actorRole === 'MEMBER' && target.userId !== actorId) {
      throw new ForbiddenException('Members can only leave their own workspace membership.')
    }
    if (actorRole === 'ADMIN' && target.role === 'ADMIN' && target.userId !== actorId) {
      throw new ForbiddenException('Only the workspace owner can remove another administrator.')
    }

    const removed = await this.repository.remove({ workspaceId, memberId, actorId })
    if (!removed) throw new NotFoundException('Workspace member not found.')
  }

  private async requireMembership(workspaceId: string, userId: string): Promise<WorkspaceRole> {
    const role = await this.workspaces.getMembership(workspaceId, userId)
    if (!role) throw new NotFoundException('Workspace not found.')
    return role
  }

  private requireManager(role: WorkspaceRole) {
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new ForbiddenException('Only workspace owners and administrators can manage members.')
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505'
}
