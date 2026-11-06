import { IsIn, IsNotEmpty, IsOptional, IsString, IsNumber, IsArray } from 'class-validator'

export const PROJECT_TEMPLATES = [
  'web-application-development',
  'full-stack-development',
  'backend-engineering',
  'ai-ml-projects',
  'mobile-application-development',
  'devops-and-ci-cd',
  'database-engineering',
  'system-design-projects',
] as const

export const PROJECT_SECTIONS = [
  { key: 'overview', title: 'Overview' },
  { key: 'documents', title: 'Documents' },
  { key: 'tasks', title: 'Tasks' },
  { key: 'kanban', title: 'Kanban Board' },
  { key: 'team', title: 'Team Members' },
  { key: 'activity', title: 'Activity Feed' },
  { key: 'settings', title: 'Project Settings' },
] as const

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  dueDate?: string

  @IsNumber()
  @IsOptional()
  progress?: number

  @IsString()
  @IsOptional()
  workspaceId?: string

  @IsString()
  @IsOptional()
  tone?: string

  @IsString()
  @IsIn(PROJECT_TEMPLATES)
  @IsOptional()
  template?: (typeof PROJECT_TEMPLATES)[number]

  @IsArray()
  @IsOptional()
  members?: string[]
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @IsOptional()
  progress?: number

  @IsString()
  @IsOptional()
  dueDate?: string

  @IsString()
  @IsOptional()
  tone?: string

  @IsString()
  @IsIn(PROJECT_TEMPLATES)
  @IsOptional()
  template?: (typeof PROJECT_TEMPLATES)[number]

  @IsArray()
  @IsOptional()
  members?: string[]
}
