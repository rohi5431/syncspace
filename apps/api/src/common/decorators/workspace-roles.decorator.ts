import { SetMetadata } from '@nestjs/common'
import type { WorkspaceRole } from '@syncspace/contracts'

export const WORKSPACE_ROLES_KEY = 'workspaceRoles'
export const WorkspaceRoles = (...roles: WorkspaceRole[]) => SetMetadata(WORKSPACE_ROLES_KEY, roles)
