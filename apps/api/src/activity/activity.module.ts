import { Module } from '@nestjs/common'
import { WorkspacesModule } from '../workspaces/workspaces.module'
import { ActivityController } from './activity.controller'
import { ActivityRepository } from './activity.repository'
import { ActivityService } from './activity.service'

@Module({
  imports: [WorkspacesModule],
  controllers: [ActivityController],
  providers: [ActivityRepository, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
