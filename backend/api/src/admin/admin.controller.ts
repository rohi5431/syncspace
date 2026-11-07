import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { IsBoolean } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminActor, AdminService } from './admin.service'
import { PlatformAdminGuard } from './platform-admin.guard'
import { AuthenticatedRequest } from '../auth/authenticated-request'

class SetSuspensionDto {
  @IsBoolean()
  suspended!: boolean
}

@Controller('api/admin')
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview(@Query('range') range = '30d') {
    return this.adminService.getOverview(range)
  }

  @Get('users')
  getUsers(@Query() query: Record<string, string | undefined>) {
    return this.adminService.getUsers(query)
  }

  @Get('users/:id')
  getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id)
  }

  @Get('workspaces')
  getWorkspaces(@Query() query: Record<string, string | undefined>) {
    return this.adminService.getWorkspaces(query)
  }

  @Get('workspaces/:id')
  getWorkspaceDetails(@Param('id') id: string) {
    return this.adminService.getWorkspaceDetails(id)
  }

  @Patch('users/:id/suspension')
  setUserSuspension(
    @Param('id') id: string,
    @Body() dto: SetSuspensionDto,
    @Request() req: AuthenticatedRequest & { ip?: string; headers?: Record<string, string | string[] | undefined> },
  ) {
    return this.adminService.setUserSuspension(id, dto.suspended, this.actor(req))
  }

  @Post('users/:id/revoke-sessions')
  revokeUserSessions(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest & { ip?: string; headers?: Record<string, string | string[] | undefined> },
  ) {
    return this.adminService.revokeUserSessions(id, this.actor(req))
  }

  @Patch('workspaces/:id/suspension')
  setWorkspaceSuspension(
    @Param('id') id: string,
    @Body() dto: SetSuspensionDto,
    @Request() req: AuthenticatedRequest & { ip?: string; headers?: Record<string, string | string[] | undefined> },
  ) {
    return this.adminService.setWorkspaceSuspension(id, dto.suspended, this.actor(req))
  }

  @Get('audit-logs')
  getAuditLogs(@Query() query: Record<string, string | undefined>) {
    return this.adminService.getAuditLogs(query)
  }

  private actor(req: AuthenticatedRequest & { ip?: string; headers?: Record<string, string | string[] | undefined> }): AdminActor {
    const headerRequestId = req.headers?.['x-request-id']
    return {
      id: req.user.id,
      email: req.user.email,
      ipAddress: req.ip,
      requestId: Array.isArray(headerRequestId) ? headerRequestId[0] : headerRequestId,
    }
  }
}
