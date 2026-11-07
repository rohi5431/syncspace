import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AuthenticatedRequest } from '../auth/authenticated-request'

@UseGuards(JwtAuthGuard)
@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query('workspaceId') workspaceId: string | undefined, @Request() req: AuthenticatedRequest) {
    return this.projectsService.findAll(req.user.id, workspaceId)
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @Request() req: AuthenticatedRequest) {
    return this.projectsService.create(dto, req.user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.projectsService.findOne(id, req.user.id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Request() req: AuthenticatedRequest) {
    return this.projectsService.update(id, dto, req.user.id)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.projectsService.remove(id, req.user.id)
  }
}
