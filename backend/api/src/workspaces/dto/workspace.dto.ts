import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsOptional()
  slug?: string
}

export class UpdateWorkspaceDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  slug?: string
}

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  email!: string

  @IsString()
  @IsOptional()
  role?: string
}
