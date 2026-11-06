import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto'

@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query('workspaceId') workspaceId?: string) {
    return this.projectsService.findAll(workspaceId)
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(dto, req.user)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id)
  }
}
