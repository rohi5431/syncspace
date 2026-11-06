import { Transform } from 'class-transformer'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Design team', minLength: 2, maxLength: 80 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string

  @ApiPropertyOptional({ example: 'Product design and research', maxLength: 500 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string
}

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {}
