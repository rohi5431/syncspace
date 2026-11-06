import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import type { WorkspaceRole, WorkspaceSummary } from '@syncspace/contracts'
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto'
import { WorkspacesRepository } from './workspaces.repository'

@Injectable()
export class WorkspacesService {
  constructor(private readonly repository: WorkspacesRepository) {}

  list(userId: string) {
    return this.repository.listForUser(userId)
  }

  async get(workspaceId: string, userId: string): Promise<WorkspaceSummary> {
    const workspace = await this.repository.findForUser(workspaceId, userId)
    if (!workspace) throw new NotFoundException('Workspace not found.')
    return workspace
  }

  getMembership(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    return this.repository.getMembership(workspaceId, userId)
  }

  create(userId: string, input: CreateWorkspaceDto) {
    return this.repository.createForUser({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      ownerId: userId,
    })
  }

  async update(workspaceId: string, userId: string, input: UpdateWorkspaceDto) {
    if (!Object.keys(input).length) throw new BadRequestException('Provide a workspace name or description to update.')

    const membership = await this.requireMembership(workspaceId, userId)
    this.requireRole(membership, ['OWNER', 'ADMIN'])

    const workspace = await this.repository.updateForMember(workspaceId, userId, {
      name: input.name?.trim(),
      description: input.description === undefined ? undefined : input.description.trim() || null,
    })
    if (!workspace) throw new NotFoundException('Workspace not found.')
    return workspace
  }

  async remove(workspaceId: string, userId: string) {
    const membership = await this.requireMembership(workspaceId, userId)
    this.requireRole(membership, ['OWNER'])

    const removed = await this.repository.deleteForMember(workspaceId, userId)
    if (!removed) throw new NotFoundException('Workspace not found.')
  }

  private async requireMembership(workspaceId: string, userId: string) {
    const membership = await this.repository.getMembership(workspaceId, userId)
    if (!membership) throw new NotFoundException('Workspace not found.')
    return membership
  }

  private requireRole(role: WorkspaceRole, allowedRoles: WorkspaceRole[]) {
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException('Your workspace role cannot perform this action.')
    }
  }
}
