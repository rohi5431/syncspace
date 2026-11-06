import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsInt, IsOptional, Max, MaxLength, Min } from 'class-validator'

export class ActivityQueryDto {
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

  @ApiPropertyOptional({ maxLength: 40 })
  @IsOptional()
  @IsIn(['workspace', 'document', 'folder', 'member'])
  @MaxLength(40)
  resourceType?: string
}
