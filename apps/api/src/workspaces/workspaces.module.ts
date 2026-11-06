import { Module } from '@nestjs/common'
import { WorkspaceRoleGuard } from '../common/guards/workspace-role.guard'
import { WorkspacesController } from './workspaces.controller'
import { WorkspacesRepository } from './workspaces.repository'
import { WorkspacesService } from './workspaces.service'

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesRepository, WorkspacesService, WorkspaceRoleGuard],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
