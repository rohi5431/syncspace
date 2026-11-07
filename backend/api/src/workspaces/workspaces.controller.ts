import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { WorkspacesService } from './workspaces.service'
import { CreateWorkspaceDto, UpdateWorkspaceDto, AddMemberDto } from './dto/workspace.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AuthenticatedRequest } from '../auth/authenticated-request'

@UseGuards(JwtAuthGuard)
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.workspacesService.findAll(req.user.id)
  }

  @Post()
  create(@Body() dto: CreateWorkspaceDto, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.create(dto, req.user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.findOne(id, req.user.id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.update(id, dto, req.user.id)
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.getMembers(id, req.user.id)
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.addMember(id, dto, req.user.id)
  }

  @Delete(':id/members/:memberId')
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.removeMember(id, memberId, req.user.id)
  }
}
