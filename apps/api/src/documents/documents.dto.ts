import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateDocumentDto {
  @ApiProperty({ example: 'Project architecture', minLength: 1, maxLength: 200 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string

  @ApiPropertyOptional({ example: 'System architecture documentation', maxLength: 5000 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  folderId?: string | null
}

export class ListDocumentsQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  page = 1

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20

  @ApiPropertyOptional({ maxLength: 200 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string

  @ApiPropertyOptional({ description: 'Use "root" to list documents not inside a folder.', nullable: true })
  @ValidateIf((_object, value) => value !== undefined && value !== null && value !== 'root')
  @IsUUID()
  folderId?: string | null

  @ApiPropertyOptional({ enum: ['createdAt', 'updatedAt'], default: 'updatedAt' })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  sortBy: 'createdAt' | 'updatedAt' = 'updatedAt'

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection: 'asc' | 'desc' = 'desc'
}

export class UpdateDocumentMetadataDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 200 })
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string

  @ApiPropertyOptional({ nullable: true, maxLength: 5000 })
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(5000)
  description?: string | null

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  folderId?: string | null

  @ApiPropertyOptional()
  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  isArchived?: boolean
}

export class ListVersionsQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  page = 1

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20
}

export class UpdateDocumentContentDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  content!: Record<string, unknown>

  @ApiPropertyOptional({ maxLength: 500 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  changeSummary?: string
}

export class ShareDocumentDto {
  @ApiProperty({ example: 'teammate@example.com' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email!: string

  @ApiProperty({ enum: ['VIEWER', 'EDITOR'] })
  @IsIn(['VIEWER', 'EDITOR'])
  role!: 'VIEWER' | 'EDITOR'
}

export class UpdateDocumentPermissionDto {
  @ApiProperty({ enum: ['VIEWER', 'EDITOR'] })
  @IsIn(['VIEWER', 'EDITOR'])
  role!: 'VIEWER' | 'EDITOR'
}
