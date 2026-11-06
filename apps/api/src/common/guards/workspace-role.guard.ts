import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import type { WorkspaceRole } from '@syncspace/contracts'
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator'
import type { AuthenticatedUser } from '../types/authenticated-user'
import { WorkspacesService } from '../../workspaces/workspaces.service'

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly workspaces: WorkspacesService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<WorkspaceRole[]>(WORKSPACE_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!roles?.length) return true

    const request = context.switchToHttp().getRequest<Request>()
    const user = request.user as AuthenticatedUser | undefined
    const rawWorkspaceId = request.params.id
    const workspaceId = Array.isArray(rawWorkspaceId) ? rawWorkspaceId[0] : rawWorkspaceId
    if (!user || typeof workspaceId !== 'string' || !workspaceId) {
      throw new ForbiddenException('Workspace access is not allowed.')
    }

    const membership = await this.workspaces.getMembership(workspaceId, user.id)
    if (!membership) throw new NotFoundException('Workspace not found.')
    if (!roles.includes(membership)) throw new ForbiddenException('Your workspace role cannot perform this action.')

    return true
  }
}
