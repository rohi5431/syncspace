import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsOptional()
  dueDate?: string

  @IsString()
  @IsOptional()
  assignedTo?: string

  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  @IsOptional()
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsBoolean()
  @IsOptional()
  completed?: boolean

  @IsString()
  @IsOptional()
  dueDate?: string

  @IsString()
  @IsOptional()
  assignedTo?: string

  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  @IsOptional()
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
}
