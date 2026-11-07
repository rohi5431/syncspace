import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { PlatformAdminGuard } from './platform-admin.guard'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [AdminController],
  providers: [AdminService, PlatformAdminGuard],
})
export class AdminModule {}
