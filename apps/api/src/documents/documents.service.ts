import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import type {
  DocumentDetail,
  DocumentPermissionSummary,
  DocumentSummary,
  DocumentVersionSummary,
  PaginatedResult,
  WorkspaceRole,
} from '@syncspace/contracts'
import { WorkspacesService } from '../workspaces/workspaces.service'
import { FoldersService } from '../folders/folders.service'
import type {
  CreateDocumentDto,
  ListDocumentsQueryDto,
  ListVersionsQueryDto,
  ShareDocumentDto,
  UpdateDocumentContentDto,
  UpdateDocumentMetadataDto,
  UpdateDocumentPermissionDto,
} from './documents.dto'
import { DocumentsRepository } from './documents.repository'

@Injectable()
export class DocumentsService {
  constructor(
    private readonly repository: DocumentsRepository,
    private readonly workspaces: WorkspacesService,
    private readonly folders: FoldersService,
  ) {}

  async create(workspaceId: string, userId: string, input: CreateDocumentDto): Promise<DocumentDetail> {
    await this.requireMembership(workspaceId, userId)
    if (input.folderId) await this.folders.assertInWorkspace(input.folderId, workspaceId)
    return this.repository.create({
      workspaceId,
      userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      folderId: input.folderId ?? null,
    })
  }

  async list(
    workspaceId: string,
    userId: string,
    query: ListDocumentsQueryDto,
  ): Promise<PaginatedResult<DocumentSummary>> {
    const role = await this.requireMembership(workspaceId, userId)
    if (query.folderId && query.folderId !== 'root') {
      await this.folders.assertInWorkspace(query.folderId, workspaceId)
    }
    return this.repository.list(workspaceId, userId, role, query)
  }

  async get(documentId: string, userId: string): Promise<DocumentDetail> {
    return (await this.requireAccess(documentId, userId)).document
  }

  async getAccess(documentId: string, userId: string) {
    return this.requireAccess(documentId, userId)
  }

  async setFavorite(documentId: string, userId: string, isFavorite: boolean) {
    await this.requireAccess(documentId, userId)
    await this.repository.setFavorite(documentId, userId, isFavorite)
    return { isFavorite }
  }

  async createVersion(documentId: string, userId: string, input: UpdateDocumentContentDto) {
    const access = await this.requireAccess(documentId, userId)
    this.requireEdit(access.canEdit)
    const versionNumber = await this.repository.updateContent(
      documentId,
      userId,
      input.content,
      input.changeSummary?.trim() || null,
    )
    if (versionNumber === null) throw new NotFoundException('Document not found.')
    return { document: await this.get(documentId, userId), versionNumber }
  }

  async restoreVersionContent(documentId: string, versionId: string, userId: string) {
    const access = await this.requireAccess(documentId, userId)
    this.requireEdit(access.canEdit)
    const version = await this.repository.getVersion(documentId, versionId)
    if (!version) throw new NotFoundException('Document version not found.')
    return { title: version.title, content: version.content, versionNumber: version.versionNumber }
  }

  async updateMetadata(documentId: string, userId: string, input: UpdateDocumentMetadataDto): Promise<DocumentDetail> {
    if (!Object.keys(input).length) throw new BadRequestException('Provide document metadata to update.')
    const access = await this.requireAccess(documentId, userId)
    this.requireEdit(access.canEdit)
    if (input.folderId) await this.folders.assertInWorkspace(input.folderId, access.document.workspaceId)

    const updated = await this.repository.updateMetadata(documentId, userId, {
      title: input.title,
      description: input.description === undefined ? undefined : input.description?.trim() || null,
      folderId: input.folderId,
      isArchived: input.isArchived,
    })
    if (!updated) throw new NotFoundException('Document not found.')
    return (await this.requireAccess(documentId, userId)).document
  }

  async remove(documentId: string, userId: string) {
    const access = await this.requireAccess(documentId, userId)
    if (!access.canDelete) throw new ForbiddenException('Only the document creator or a workspace administrator can delete it.')
    const removed = await this.repository.softDelete(documentId, userId)
    if (!removed) throw new NotFoundException('Document not found.')
  }

  async duplicate(documentId: string, userId: string): Promise<DocumentDetail> {
    const access = await this.requireAccess(documentId, userId)
    this.requireEdit(access.canEdit)
    const duplicate = await this.repository.duplicate(documentId, userId)
    if (!duplicate) throw new NotFoundException('Document not found.')
    return duplicate
  }

  async updateContent(documentId: string, userId: string, input: UpdateDocumentContentDto) {
    const access = await this.requireAccess(documentId, userId)
    this.requireEdit(access.canEdit)
    const versionNumber = await this.repository.updateContent(
      documentId,
      userId,
      input.content,
      input.changeSummary?.trim() || null,
    )
    if (versionNumber === null) throw new NotFoundException('Document not found.')
    return { document: await this.get(documentId, userId), versionNumber }
  }

  async listPermissions(documentId: string, userId: string): Promise<DocumentPermissionSummary[]> {
    const access = await this.requireAccess(documentId, userId)
    if (!access.canManageSharing) throw new ForbiddenException('Only the document creator or a workspace administrator can manage sharing.')
    return this.repository.listPermissions(documentId)
  }

  async share(documentId: string, userId: string, input: ShareDocumentDto): Promise<DocumentPermissionSummary | null> {
    const access = await this.requireAccess(documentId, userId)
    this.requireSharing(access.canManageSharing)
    const target = await this.repository.findWorkspaceMemberByEmail(access.document.workspaceId, input.email)
    if (!target) throw new NotFoundException('That user is not a member of this workspace.')
    if (target.id === userId) throw new BadRequestException('You already have access as the document creator.')
    const result = await this.repository.upsertPermission({
      workspaceId: access.document.workspaceId,
      documentId,
      actorId: userId,
      targetUserId: target.id,
      targetName: target.name,
      role: input.role,
    })
    return result.permission
  }

  async updatePermission(
    documentId: string,
    permissionId: string,
    userId: string,
    input: UpdateDocumentPermissionDto,
  ): Promise<DocumentPermissionSummary> {
    const access = await this.requireAccess(documentId, userId)
    this.requireSharing(access.canManageSharing)
    const permission = await this.repository.updatePermission({
      workspaceId: access.document.workspaceId,
      documentId,
      permissionId,
      actorId: userId,
      role: input.role,
    })
    if (!permission) throw new NotFoundException('Document permission not found.')
    return permission
  }

  async removePermission(documentId: string, permissionId: string, userId: string) {
    const access = await this.requireAccess(documentId, userId)
    this.requireSharing(access.canManageSharing)
    const removed = await this.repository.removePermission({
      workspaceId: access.document.workspaceId,
      documentId,
      permissionId,
      actorId: userId,
    })
    if (!removed) throw new NotFoundException('Document permission not found.')
  }

  async listVersions(documentId: string, userId: string, query: ListVersionsQueryDto): Promise<PaginatedResult<DocumentVersionSummary>> {
    await this.requireAccess(documentId, userId)
    return this.repository.listVersions(documentId, query.page, query.pageSize)
  }

  async getVersion(documentId: string, versionId: string, userId: string): Promise<DocumentVersionSummary> {
    await this.requireAccess(documentId, userId)
    const version = await this.repository.getVersion(documentId, versionId)
    if (!version) throw new NotFoundException('Document version not found.')
    return version
  }

  private async requireAccess(documentId: string, userId: string) {
    const access = await this.repository.findAccess(documentId, userId)
    if (!access?.canRead) throw new NotFoundException('Document not found.')
    return access
  }

  private async requireMembership(workspaceId: string, userId: string): Promise<WorkspaceRole> {
    const role = await this.workspaces.getMembership(workspaceId, userId)
    if (!role) throw new NotFoundException('Workspace not found.')
    return role
  }

  private requireEdit(canEdit: boolean) {
    if (!canEdit) throw new ForbiddenException('You have view-only access to this document.')
  }

  private requireSharing(canManage: boolean) {
    if (!canManage) throw new ForbiddenException('Only the document creator or a workspace administrator can manage sharing.')
  }
}
