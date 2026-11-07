import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { StorageController } from './storage.controller'
import { AuthModule } from '../auth/auth.module'
import { WorkspaceMembershipGuard } from '../auth/workspace-membership.guard'

@Module({
  imports: [AuthModule],
  controllers: [StorageController],
  providers: [StorageService, WorkspaceMembershipGuard],
  exports: [StorageService],
})
export class StorageModule {}
