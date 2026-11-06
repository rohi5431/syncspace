import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto'

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('api/projects/:projectId/tasks')
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(projectId)
  }

  @Post('api/projects/:projectId/tasks')
  create(@Param('projectId') projectId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(projectId, dto)
  }

  @Patch('api/tasks/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto)
  }

  @Delete('api/tasks/:id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id)
  }
}
