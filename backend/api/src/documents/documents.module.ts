import { Module } from '@nestjs/common'
import { DocumentsService } from './documents.service'
import { DocumentsController } from './documents.controller'
import { AuthModule } from '../auth/auth.module'
import { WorkspaceMembershipGuard } from '../auth/workspace-membership.guard'

@Module({
  imports: [AuthModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, WorkspaceMembershipGuard],
  exports: [DocumentsService],
})
export class DocumentsModule {}
