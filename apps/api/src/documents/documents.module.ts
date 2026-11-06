import { Module } from '@nestjs/common'
import { FoldersModule } from '../folders/folders.module'
import { WorkspacesModule } from '../workspaces/workspaces.module'
import { DocumentsController } from './documents.controller'
import { DocumentsRepository } from './documents.repository'
import { DocumentsService } from './documents.service'

@Module({
  imports: [WorkspacesModule, FoldersModule],
  controllers: [DocumentsController],
  providers: [DocumentsRepository, DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
