import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { MetricsModule } from './metrics/metrics.module'
import { HealthModule } from './health/health.module'
import { JobsModule } from './jobs/jobs.module'
import { AuthModule } from './auth/auth.module'
import { WorkspacesModule } from './workspaces/workspaces.module'
import { DocumentsModule } from './documents/documents.module'
import { ProjectsModule } from './projects/projects.module'
import { TasksModule } from './tasks/tasks.module'
import { ActivityModule } from './activity/activity.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { StorageModule } from './storage/storage.module'

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    MetricsModule,
    HealthModule,
    JobsModule,
    AuthModule,
    WorkspacesModule,
    DocumentsModule,
    ProjectsModule,
    TasksModule,
    ActivityModule,
    DashboardModule,
    StorageModule,
  ],
})
export class AppModule {}
