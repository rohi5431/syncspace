import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common'
import { WorkspacesService } from './workspaces.service'
import { CreateWorkspaceDto, UpdateWorkspaceDto, AddMemberDto } from './dto/workspace.dto'

@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.workspacesService.findAll(userId)
  }

  @Post()
  create(@Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(dto)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workspacesService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.workspacesService.update(id, dto)
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.workspacesService.getMembers(id)
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.workspacesService.addMember(id, dto)
  }

  @Delete(':id/members/:memberId')
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.workspacesService.removeMember(id, memberId)
  }
}
