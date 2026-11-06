import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  action!: string

  @IsString()
  @IsNotEmpty()
  target!: string

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  initials?: string

  @IsString()
  @IsOptional()
  tone?: string

  @IsString()
  @IsOptional()
  workspaceId?: string
}
