import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export const DOCUMENT_TYPES = [
  'SRS',
  'HLD',
  'LLD',
  'API_DOCUMENTATION',
  'DATABASE_DESIGN',
  'README',
  'TECHNICAL_DOCUMENTATION',
  'MEETING_NOTES',
  'SPRINT_REPORT',
  'RELEASE_NOTES',
  'BUG_REPORT',
  'ARCHITECTURE_DIAGRAM',
] as const

export const DOCUMENT_EDITORS = ['rich-text', 'markdown', 'code', 'diagram', 'file'] as const

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsOptional()
  category?: string

  @IsString()
  @IsOptional()
  content?: string

  @IsString()
  @IsOptional()
  workspaceId?: string

  @IsString()
  @IsOptional()
  projectId?: string

  @IsString()
  @IsOptional()
  folderId?: string

  @IsString()
  @IsIn(DOCUMENT_TYPES)
  @IsOptional()
  type?: (typeof DOCUMENT_TYPES)[number]

  @IsString()
  @IsIn(DOCUMENT_EDITORS)
  @IsOptional()
  editor?: (typeof DOCUMENT_EDITORS)[number]

  @IsString()
  @IsOptional()
  authorName?: string

  @IsString()
  @IsOptional()
  initials?: string

  @IsString()
  @IsOptional()
  tone?: string
}

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsNotEmpty()
  workspaceId!: string

  @IsString()
  @IsOptional()
  parentId?: string
}

export class RenameFolderDto {
  @IsString()
  @IsNotEmpty()
  name!: string
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string

  @IsString()
  @IsOptional()
  anchor?: string
}

export class SetPermissionDto {
  @IsEmail()
  email!: string

  @IsString()
  @IsIn(['VIEWER', 'EDITOR'])
  role!: 'VIEWER' | 'EDITOR'
}

export class CreateDocumentUpdateDto {
  @IsString()
  @IsNotEmpty()
  update!: string
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  category?: string

  @IsString()
  @IsOptional()
  content?: string

  @IsString()
  @IsOptional()
  tone?: string

  @IsString()
  @IsOptional()
  projectId?: string

  @IsString()
  @IsOptional()
  folderId?: string

  @IsString()
  @IsIn(DOCUMENT_TYPES)
  @IsOptional()
  type?: (typeof DOCUMENT_TYPES)[number]

  @IsString()
  @IsIn(DOCUMENT_EDITORS)
  @IsOptional()
  editor?: (typeof DOCUMENT_EDITORS)[number]

  @IsBoolean()
  @IsOptional()
  starred?: boolean
}
