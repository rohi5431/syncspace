import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common'
import { ActivityService } from './activity.service'
import { CreateActivityDto } from './dto/activity.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { WorkspaceMembershipGuard } from '../auth/workspace-membership.guard'

@UseGuards(JwtAuthGuard, WorkspaceMembershipGuard)
@Controller('api/activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  findAll(@Query('workspaceId') workspaceId: string, @Query('limit') limit?: number) {
    return this.activityService.findAll(workspaceId, limit)
  }

  @Post()
  record(@Body() dto: CreateActivityDto, @Request() req: any) {
    return this.activityService.record(dto, req.user)
  }
}
