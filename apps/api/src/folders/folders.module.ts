import { Module } from '@nestjs/common'
import { WorkspacesModule } from '../workspaces/workspaces.module'
import { FoldersController } from './folders.controller'
import { FoldersRepository } from './folders.repository'
import { FoldersService } from './folders.service'

@Module({
  imports: [WorkspacesModule],
  controllers: [FoldersController],
  providers: [FoldersRepository, FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
