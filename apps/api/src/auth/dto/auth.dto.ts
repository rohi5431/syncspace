import { Transform } from 'class-transformer'
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'Jordan Lee', minLength: 2, maxLength: 80 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string

  @ApiProperty({ example: 'jordan@example.com', maxLength: 254 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email!: string

  @ApiProperty({ minLength: 8, maxLength: 72, writeOnly: true })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string
}

export class LoginDto {
  @ApiProperty({ example: 'jordan@example.com', maxLength: 254 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email!: string

  @ApiProperty({ minLength: 1, maxLength: 72, writeOnly: true })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password!: string

  @ApiPropertyOptional({ default: true, description: 'Keep the refresh session for 30 days instead of 24 hours.' })
  @IsOptional()
  @IsBoolean()
  remember?: boolean
}
