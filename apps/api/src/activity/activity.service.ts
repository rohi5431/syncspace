import { Injectable, NotFoundException } from '@nestjs/common'
import type { PaginatedResult, WorkspaceActivityItem } from '@syncspace/contracts'
import { WorkspacesService } from '../workspaces/workspaces.service'
import type { ActivityQueryDto } from './activity.dto'
import { ActivityRepository } from './activity.repository'

@Injectable()
export class ActivityService {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly workspaces: WorkspacesService,
  ) {}

  async list(workspaceId: string, userId: string, query: ActivityQueryDto): Promise<PaginatedResult<WorkspaceActivityItem>> {
    const role = await this.workspaces.getMembership(workspaceId, userId)
    if (!role) throw new NotFoundException('Workspace not found.')
    return this.repository.list(workspaceId, userId, role, query)
  }
}
