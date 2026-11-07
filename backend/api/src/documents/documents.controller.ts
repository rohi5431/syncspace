import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common'
import { DocumentsService } from './documents.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { WorkspaceMembershipGuard } from '../auth/workspace-membership.guard'
import {
  CreateCommentDto,
  CreateDocumentDto,
  CreateDocumentUpdateDto,
  CreateFolderDto,
  RenameFolderDto,
  SetPermissionDto,
  UpdateDocumentDto,
} from './dto/document.dto'

@UseGuards(JwtAuthGuard, WorkspaceMembershipGuard)
@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(@Query('workspaceId') workspaceId?: string, @Query('q') q?: string) {
    return this.documentsService.findAll(workspaceId, q)
  }

  @Post()
  create(@Body() dto: CreateDocumentDto, @Request() req: { user?: { id?: string; name?: string; initials?: string } }) {
    return this.documentsService.create(dto, req.user)
  }

  @Get('folders')
  listFolders(@Query('workspaceId') workspaceId: string) {
    return this.documentsService.listFolders(workspaceId)
  }

  @Post('folders')
  createFolder(@Body() dto: CreateFolderDto) {
    return this.documentsService.createFolder(dto)
  }

  @Patch('folders/:folderId')
  renameFolder(@Param('folderId') folderId: string, @Body() dto: RenameFolderDto) {
    return this.documentsService.renameFolder(folderId, dto)
  }

  @Delete('folders/:folderId')
  removeFolder(@Param('folderId') folderId: string) {
    return this.documentsService.removeFolder(folderId)
  }

  @Get(':id/versions')
  listVersions(@Param('id') id: string) {
    return this.documentsService.listVersions(id)
  }

  @Post(':id/versions/:versionId/restore')
  restoreVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Request() req: { user?: { id?: string; name?: string } },
  ) {
    return this.documentsService.restoreVersion(id, versionId, req.user)
  }

  @Get(':id/comments')
  listComments(@Param('id') id: string) {
    return this.documentsService.listComments(id)
  }

  @Post(':id/comments')
  createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @Request() req: { user?: { id?: string; name?: string } },
  ) {
    return this.documentsService.createComment(id, dto, req.user)
  }

  @Delete(':id/comments/:commentId')
  removeComment(@Param('id') id: string, @Param('commentId') commentId: string) {
    return this.documentsService.removeComment(id, commentId)
  }

  @Get(':id/permissions')
  listPermissions(@Param('id') id: string) {
    return this.documentsService.listPermissions(id)
  }

  @Put(':id/permissions')
  setPermission(@Param('id') id: string, @Body() dto: SetPermissionDto) {
    return this.documentsService.setPermission(id, dto)
  }

  @Delete(':id/permissions')
  removePermission(@Param('id') id: string, @Query('email') email: string) {
    return this.documentsService.removePermission(id, email)
  }

  @Get(':id/updates')
  listUpdates(@Param('id') id: string) {
    return this.documentsService.listUpdates(id)
  }

  @Post(':id/updates')
  appendUpdate(@Param('id') id: string, @Body() dto: CreateDocumentUpdateDto) {
    return this.documentsService.appendUpdate(id, dto)
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @Request() req: { user?: { id?: string; name?: string; initials?: string } }) {
    return this.documentsService.duplicate(id, req.user)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @Request() req: { user?: { id?: string; name?: string } },
  ) {
    return this.documentsService.update(id, dto, req.user)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id)
  }
}
