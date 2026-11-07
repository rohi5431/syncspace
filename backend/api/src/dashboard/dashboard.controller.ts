import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AuthenticatedRequest } from '../auth/authenticated-request'

@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Query('workspace') workspace: string | undefined, @Request() req: AuthenticatedRequest) {
    return this.dashboardService.getSummary(req.user.id, workspace)
  }
}
