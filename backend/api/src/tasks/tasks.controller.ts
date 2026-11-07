import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AuthenticatedRequest } from '../auth/authenticated-request'

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('api/projects/:projectId/tasks')
  findByProject(@Param('projectId') projectId: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.findByProject(projectId, req.user.id)
  }

  @Post('api/projects/:projectId/tasks')
  create(@Param('projectId') projectId: string, @Body() dto: CreateTaskDto, @Request() req: AuthenticatedRequest) {
    return this.tasksService.create(projectId, dto, req.user.id)
  }

  @Patch('api/tasks/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Request() req: AuthenticatedRequest) {
    return this.tasksService.update(id, dto, req.user.id)
  }

  @Delete('api/tasks/:id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.remove(id, req.user.id)
  }
}
