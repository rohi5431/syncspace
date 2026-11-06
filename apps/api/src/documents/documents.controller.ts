import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ACCESS_COOKIE } from '../auth/auth.cookies'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '../common/types/authenticated-user'
import {
  CreateDocumentDto,
  ListDocumentsQueryDto,
  ListVersionsQueryDto,
  ShareDocumentDto,
  UpdateDocumentContentDto,
  UpdateDocumentFavoriteDto,
  UpdateDocumentMetadataDto,
  UpdateDocumentPermissionDto,
} from './documents.dto'
import { DocumentsService } from './documents.service'

@Controller()
@ApiTags('Documents')
@ApiCookieAuth(ACCESS_COOKIE)
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post('workspaces/:workspaceId/documents')
  @ApiCreatedResponse({ description: 'Document created with an empty editor document.' })
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateDocumentDto,
  ) {
    return this.documents.create(workspaceId, user.id, body)
  }

  @Get('workspaces/:workspaceId/documents')
  @ApiOkResponse({ description: 'Paginated documents visible to the authenticated workspace member.' })
  list(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListDocumentsQueryDto,
  ) {
    return this.documents.list(workspaceId, user.id, query)
  }

  @Get('documents/:documentId')
  @ApiOkResponse({ description: 'Document details and editor JSON, when the caller has access.' })
  get(@Param('documentId', ParseUUIDPipe) documentId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documents.get(documentId, user.id)
  }

  @Patch('documents/:documentId')
  @ApiOkResponse({ description: 'Document metadata updated.' })
  updateMetadata(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateDocumentMetadataDto,
  ) {
    return this.documents.updateMetadata(documentId, user.id, body)
  }

  @Patch('documents/:documentId/content')
  @ApiOkResponse({ description: 'Document JSON saved and an immutable version snapshot created.' })
  updateContent(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateDocumentContentDto,
  ) {
    return this.documents.updateContent(documentId, user.id, body)
  }

  @Patch('documents/:documentId/favorite')
  @ApiOkResponse({ description: 'The authenticated user’s document favorite state was updated.' })
  setFavorite(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateDocumentFavoriteDto,
  ) {
    return this.documents.setFavorite(documentId, user.id, body.isFavorite)
  }

  @Delete('documents/:documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Document soft-deleted; version history is retained.' })
  async remove(@Param('documentId', ParseUUIDPipe) documentId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.documents.remove(documentId, user.id)
  }

  @Post('documents/:documentId/duplicate')
  @ApiCreatedResponse({ description: 'Current document content duplicated into a new document.' })
  duplicate(@Param('documentId', ParseUUIDPipe) documentId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documents.duplicate(documentId, user.id)
  }

  @Post('documents/:documentId/share')
  @ApiCreatedResponse({ description: 'Document access granted or updated for a workspace member.' })
  share(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ShareDocumentDto,
  ) {
    return this.documents.share(documentId, user.id, body)
  }

  @Get('documents/:documentId/permissions')
  @ApiOkResponse({ description: 'Explicit document permissions. Workspace creators and administrators only.' })
  listPermissions(@Param('documentId', ParseUUIDPipe) documentId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documents.listPermissions(documentId, user.id)
  }

  @Patch('documents/:documentId/permissions/:permissionId')
  @ApiOkResponse({ description: 'Document permission role updated.' })
  updatePermission(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateDocumentPermissionDto,
  ) {
    return this.documents.updatePermission(documentId, permissionId, user.id, body)
  }

  @Delete('documents/:documentId/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Explicit document access removed.' })
  async removePermission(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.documents.removePermission(documentId, permissionId, user.id)
  }

  @Get('documents/:documentId/versions')
  @ApiOkResponse({ description: 'Paginated immutable document version history.' })
  listVersions(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListVersionsQueryDto,
  ) {
    return this.documents.listVersions(documentId, user.id, query)
  }

  @Get('documents/:documentId/versions/:versionId')
  @ApiOkResponse({ description: 'A specific document snapshot.' })
  getVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documents.getVersion(documentId, versionId, user.id)
  }

  @Post('documents/:documentId/versions')
  @ApiCreatedResponse({ description: 'A new immutable version created from the current synchronized editor content.' })
  createVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateDocumentContentDto,
  ) {
    return this.documents.createVersion(documentId, user.id, body)
  }

  @Post('documents/:documentId/versions/:versionId/restore')
  @ApiOkResponse({ description: 'A historical snapshot returned for a permission-checked collaborative restore.' })
  restoreVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documents.restoreVersionContent(documentId, versionId, user.id)
  }
}
