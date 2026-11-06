import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { WorkspacesModule } from '../workspaces/workspaces.module'
import { WorkspaceMembersController } from './workspace-members.controller'
import { WorkspaceMembersRepository } from './workspace-members.repository'
import { WorkspaceMembersService } from './workspace-members.service'

@Module({
  imports: [WorkspacesModule, UsersModule],
  controllers: [WorkspaceMembersController],
  providers: [WorkspaceMembersRepository, WorkspaceMembersService],
  exports: [WorkspaceMembersService],
})
export class WorkspaceMembersModule {}
