import { Injectable } from '@nestjs/common'
import { and, asc, count, desc, eq, exists, isNull, ne, or, sql, type SQL } from 'drizzle-orm'
import type {
  DocumentDetail,
  DocumentPermissionRole,
  DocumentPermissionSummary,
  DocumentSummary,
  DocumentVersionSummary,
  PaginatedResult,
  PublicUserSummary,
  WorkspaceRole,
} from '@syncspace/contracts'
import { DatabaseService } from '../database/database.service'
import {
  activityLogs,
  documentFavorites,
  documentPermissions,
  documentVersions,
  documents,
  type DocumentJson,
  users,
  workspaceMembers,
} from '../database/schema'
import type { ListDocumentsQueryDto, UpdateDocumentMetadataDto } from './documents.dto'

export interface DocumentAccessRecord {
  document: DocumentDetail
  workspaceRole: WorkspaceRole
  canRead: boolean
  canEdit: boolean
  canManageSharing: boolean
  canDelete: boolean
}

@Injectable()
export class DocumentsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: {
    workspaceId: string
    userId: string
    title: string
    description: string | null
    folderId: string | null
  }): Promise<DocumentDetail> {
    const document = await this.database.db.transaction(async (transaction) => {
      const [created] = await transaction
        .insert(documents)
        .values({
          workspaceId: input.workspaceId,
          createdById: input.userId,
          title: input.title,
          description: input.description,
          folderId: input.folderId,
        })
        .returning()

      await transaction.insert(activityLogs).values({
        workspaceId: input.workspaceId,
        actorId: input.userId,
        action: 'document.created',
        resourceType: 'document',
        resourceId: created.id,
        metadata: { title: created.title },
      })
      return created
    })

    const access = await this.findAccess(document.id, input.userId)
    return access!.document
  }

  async list(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    query: ListDocumentsQueryDto,
  ): Promise<PaginatedResult<DocumentSummary>> {
    const conditions: SQL[] = [
      eq(documents.workspaceId, workspaceId),
      eq(documents.isArchived, false),
      eq(documents.isDeleted, false),
    ]

    if (role === 'MEMBER') {
      conditions.push(or(
        eq(documents.createdById, userId),
        exists(this.database.db
          .select({ id: documentPermissions.id })
          .from(documentPermissions)
          .where(and(
            eq(documentPermissions.documentId, documents.id),
            eq(documentPermissions.userId, userId),
          ))),
      )!)
    }

    if (query.folderId === 'root') conditions.push(isNull(documents.folderId))
    else if (query.folderId) conditions.push(eq(documents.folderId, query.folderId))

    if (query.search) {
      const escapedSearch = query.search.toLowerCase().replace(/[\\%_]/g, '\\$&')
      conditions.push(sql`lower(${documents.title}) LIKE ${`${escapedSearch}%`} ESCAPE '\\'`)
    }

    if (query.favoritesOnly) {
      conditions.push(exists(this.database.db
        .select({ id: documentFavorites.id })
        .from(documentFavorites)
        .where(and(
          eq(documentFavorites.documentId, documents.id),
          eq(documentFavorites.userId, userId),
        ))))
    }

    if (query.sharedOnly) {
      conditions.push(ne(documents.createdById, userId))
      conditions.push(exists(this.database.db
        .select({ id: documentPermissions.id })
        .from(documentPermissions)
        .where(and(
          eq(documentPermissions.documentId, documents.id),
          eq(documentPermissions.userId, userId),
        ))))
    }

    const where = and(...conditions)
    const [totalRecord] = await this.database.db
      .select({ total: count() })
      .from(documents)
      .where(where)

    const sortColumn = query.sortBy === 'createdAt' ? documents.createdAt : documents.updatedAt
    const sort = query.sortDirection === 'asc' ? asc : desc
    const records = await this.database.db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        workspaceId: documents.workspaceId,
        folderId: documents.folderId,
        createdById: documents.createdById,
        isArchived: documents.isArchived,
        isFavorite: sql<boolean>`${documentFavorites.id} IS NOT NULL`,
        collaboratorCount: sql<number>`(SELECT count(*)::int + 1 FROM public.document_permissions AS collaborators WHERE collaborators.document_id = ${documents.id})`,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        permissionRole: documentPermissions.role,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(documents)
      .innerJoin(users, eq(documents.createdById, users.id))
      .leftJoin(documentPermissions, and(
        eq(documentPermissions.documentId, documents.id),
        eq(documentPermissions.userId, userId),
      ))
      .leftJoin(documentFavorites, and(
        eq(documentFavorites.documentId, documents.id),
        eq(documentFavorites.userId, userId),
      ))
      .where(where)
      .orderBy(sort(sortColumn), sort(documents.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize)

    const total = Number(totalRecord?.total ?? 0)
    return {
      items: records.map((record) => this.toSummary({
        ...record,
        canEdit: role !== 'MEMBER' || record.createdById === userId || record.permissionRole === 'EDITOR',
        canManageSharing: role !== 'MEMBER' || record.createdById === userId,
        canDelete: role !== 'MEMBER' || record.createdById === userId,
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
      pageCount: Math.ceil(total / query.pageSize),
    }
  }

  async findAccess(documentId: string, userId: string): Promise<DocumentAccessRecord | null> {
    const [record] = await this.database.db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        content: documents.content,
        workspaceId: documents.workspaceId,
        folderId: documents.folderId,
        createdById: documents.createdById,
        isArchived: documents.isArchived,
        isFavorite: sql<boolean>`${documentFavorites.id} IS NOT NULL`,
        collaboratorCount: sql<number>`(SELECT count(*)::int + 1 FROM public.document_permissions AS collaborators WHERE collaborators.document_id = ${documents.id})`,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        workspaceRole: workspaceMembers.role,
        permissionRole: documentPermissions.role,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(documents)
      .innerJoin(workspaceMembers, and(
        eq(workspaceMembers.workspaceId, documents.workspaceId),
        eq(workspaceMembers.userId, userId),
      ))
      .leftJoin(documentPermissions, and(
        eq(documentPermissions.documentId, documents.id),
        eq(documentPermissions.userId, userId),
      ))
      .leftJoin(documentFavorites, and(
        eq(documentFavorites.documentId, documents.id),
        eq(documentFavorites.userId, userId),
      ))
      .innerJoin(users, eq(documents.createdById, users.id))
      .where(and(eq(documents.id, documentId), eq(documents.isDeleted, false)))
      .limit(1)

    if (!record) return null
    const manager = record.workspaceRole !== 'MEMBER' || record.createdById === userId
    const canRead = manager || record.permissionRole !== null
    return {
      document: {
        id: record.id,
        title: record.title,
        description: record.description,
        content: record.content,
        workspaceId: record.workspaceId,
        folderId: record.folderId,
        createdById: record.createdById,
        createdBy: record.creator,
        isArchived: record.isArchived,
        isFavorite: record.isFavorite,
        collaboratorCount: Number(record.collaboratorCount),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        permissionRole: record.permissionRole,
        canRead,
        canEdit: manager || record.permissionRole === 'EDITOR',
        canManageSharing: manager,
        canDelete: manager,
      },
      workspaceRole: record.workspaceRole,
      canRead,
      canEdit: manager || record.permissionRole === 'EDITOR',
      canManageSharing: manager,
      canDelete: manager,
    }
  }

  async updateMetadata(documentId: string, actorId: string, input: UpdateDocumentMetadataDto) {
    return this.database.db.transaction(async (transaction) => {
      const [current] = await transaction
        .select({ workspaceId: documents.workspaceId, title: documents.title })
        .from(documents)
        .where(and(eq(documents.id, documentId), eq(documents.isDeleted, false)))
        .limit(1)
      if (!current) return null

      const [updated] = await transaction
        .update(documents)
        .set({ ...input, updatedAt: new Date() })
        .where(and(eq(documents.id, documentId), eq(documents.isDeleted, false)))
        .returning()
      if (!updated) return null

      const renamed = input.title !== undefined && input.title !== current.title
      const action = input.isArchived === true ? 'document.archived' : renamed ? 'document.renamed' : 'document.updated'
      await transaction.insert(activityLogs).values({
        workspaceId: current.workspaceId,
        actorId,
        action,
        resourceType: 'document',
        resourceId: documentId,
        metadata: { title: updated.title },
      })
      return updated
    })
  }

  async softDelete(documentId: string, actorId: string) {
    return this.database.db.transaction(async (transaction) => {
      const [deleted] = await transaction
        .update(documents)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(and(eq(documents.id, documentId), eq(documents.isDeleted, false)))
        .returning({ id: documents.id, workspaceId: documents.workspaceId, title: documents.title })
      if (!deleted) return false
      await transaction.insert(activityLogs).values({
        workspaceId: deleted.workspaceId,
        actorId,
        action: 'document.deleted',
        resourceType: 'document',
        resourceId: deleted.id,
        metadata: { title: deleted.title },
      })
      return true
    })
  }

  async duplicate(documentId: string, actorId: string) {
    const id = await this.database.db.transaction(async (transaction) => {
      const [source] = await transaction
        .select()
        .from(documents)
        .where(and(eq(documents.id, documentId), eq(documents.isDeleted, false)))
        .limit(1)
      if (!source) return null

      const title = `Copy of ${source.title}`.slice(0, 200)
      const [copy] = await transaction
        .insert(documents)
        .values({
          title,
          description: source.description,
          content: source.content,
          workspaceId: source.workspaceId,
          folderId: source.folderId,
          createdById: actorId,
        })
        .returning({ id: documents.id })

      await transaction.insert(activityLogs).values({
        workspaceId: source.workspaceId,
        actorId,
        action: 'document.duplicated',
        resourceType: 'document',
        resourceId: source.id,
        metadata: { title: source.title, duplicateId: copy.id, duplicateTitle: title },
      })
      return copy.id
    })

    if (!id) return null
    const access = await this.findAccess(id, actorId)
    return access?.document ?? null
  }

  async updateContent(documentId: string, actorId: string, content: DocumentJson, changeSummary: string | null) {
    return this.database.db.transaction(async (transaction) => {
      const [current] = await transaction
        .select({ id: documents.id, workspaceId: documents.workspaceId })
        .from(documents)
        .where(and(eq(documents.id, documentId), eq(documents.isDeleted, false)))
        .for('update')
      if (!current) return null

      const [versionRecord] = await transaction
        .select({ latest: sql<number>`coalesce(max(${documentVersions.versionNumber}), 0)` })
        .from(documentVersions)
        .where(eq(documentVersions.documentId, documentId))
      const versionNumber = Number(versionRecord?.latest ?? 0) + 1
      const [updated] = await transaction
        .update(documents)
        .set({ content, updatedAt: new Date() })
        .where(eq(documents.id, documentId))
        .returning()

      await transaction.insert(documentVersions).values({
        documentId,
        versionNumber,
        title: updated.title,
        content,
        createdById: actorId,
        changeSummary,
      })
      await transaction.insert(activityLogs).values({
        workspaceId: current.workspaceId,
        actorId,
        action: 'document.content_updated',
        resourceType: 'document',
        resourceId: documentId,
        metadata: { title: updated.title, versionNumber },
      })
      return versionNumber
    })
  }

  async listVersions(documentId: string, page: number, pageSize: number): Promise<PaginatedResult<DocumentVersionSummary>> {
    const where = eq(documentVersions.documentId, documentId)
    const [totalRecord] = await this.database.db
      .select({ total: count() })
      .from(documentVersions)
      .where(where)
    const records = await this.database.db
      .select({
        id: documentVersions.id,
        documentId: documentVersions.documentId,
        versionNumber: documentVersions.versionNumber,
        title: documentVersions.title,
        content: documentVersions.content,
        createdById: documentVersions.createdById,
        createdAt: documentVersions.createdAt,
        changeSummary: documentVersions.changeSummary,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(documentVersions)
      .innerJoin(users, eq(documentVersions.createdById, users.id))
      .where(where)
      .orderBy(desc(documentVersions.versionNumber))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    const total = Number(totalRecord?.total ?? 0)
    return {
      items: records.map((record) => this.toVersion(record)),
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    }
  }

  async getVersion(documentId: string, versionId: string): Promise<DocumentVersionSummary | null> {
    const [record] = await this.database.db
      .select({
        id: documentVersions.id,
        documentId: documentVersions.documentId,
        versionNumber: documentVersions.versionNumber,
        title: documentVersions.title,
        content: documentVersions.content,
        createdById: documentVersions.createdById,
        createdAt: documentVersions.createdAt,
        changeSummary: documentVersions.changeSummary,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(documentVersions)
      .innerJoin(users, eq(documentVersions.createdById, users.id))
      .where(and(eq(documentVersions.documentId, documentId), eq(documentVersions.id, versionId)))
      .limit(1)
    return record ? this.toVersion(record) : null
  }

  async setFavorite(documentId: string, userId: string, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      await this.database.db
        .insert(documentFavorites)
        .values({ documentId, userId })
        .onConflictDoNothing({ target: [documentFavorites.documentId, documentFavorites.userId] })
      return
    }

    await this.database.db
      .delete(documentFavorites)
      .where(and(
        eq(documentFavorites.documentId, documentId),
        eq(documentFavorites.userId, userId),
      ))
  }

  async listPermissions(documentId: string): Promise<DocumentPermissionSummary[]> {
    const records = await this.database.db
      .select({
        id: documentPermissions.id,
        documentId: documentPermissions.documentId,
        userId: documentPermissions.userId,
        role: documentPermissions.role,
        createdAt: documentPermissions.createdAt,
        updatedAt: documentPermissions.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(documentPermissions)
      .innerJoin(users, eq(documentPermissions.userId, users.id))
      .where(eq(documentPermissions.documentId, documentId))
      .orderBy(asc(users.name))

    return records.map((record) => ({
      ...record,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }))
  }

  async findWorkspaceMemberByEmail(workspaceId: string, email: string): Promise<PublicUserSummary | null> {
    const [record] = await this.database.db
      .select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(and(
        eq(workspaceMembers.workspaceId, workspaceId),
        sql`lower(${users.email}) = ${email.toLowerCase()}`,
      ))
      .limit(1)
    return record ?? null
  }

  async upsertPermission(input: {
    workspaceId: string
    documentId: string
    actorId: string
    targetUserId: string
    targetName: string
    role: DocumentPermissionRole
  }) {
    const result = await this.database.db.transaction(async (transaction) => {
      const [existing] = await transaction
        .select({ id: documentPermissions.id, role: documentPermissions.role })
        .from(documentPermissions)
        .where(and(
          eq(documentPermissions.documentId, input.documentId),
          eq(documentPermissions.userId, input.targetUserId),
        ))
        .limit(1)

      if (existing?.role === input.role) return { changed: false, action: null }
      if (existing) {
        await transaction
          .update(documentPermissions)
          .set({ role: input.role, updatedAt: new Date() })
          .where(eq(documentPermissions.id, existing.id))
      } else {
        await transaction.insert(documentPermissions).values({
          documentId: input.documentId,
          userId: input.targetUserId,
          createdById: input.actorId,
          role: input.role,
        })
      }

      const action = existing ? 'document.permission_updated' : 'document.shared'
      await transaction.insert(activityLogs).values({
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action,
        resourceType: 'document',
        resourceId: input.documentId,
        metadata: { userId: input.targetUserId, userName: input.targetName, role: input.role },
      })
      return { changed: true, action }
    })

    const permissions = await this.listPermissions(input.documentId)
    return { permission: permissions.find((permission) => permission.userId === input.targetUserId) ?? null, ...result }
  }

  async updatePermission(input: {
    workspaceId: string
    documentId: string
    permissionId: string
    actorId: string
    role: DocumentPermissionRole
  }) {
    const result = await this.database.db.transaction(async (transaction) => {
      const [existing] = await transaction
        .select({ id: documentPermissions.id, userId: documentPermissions.userId })
        .from(documentPermissions)
        .where(and(
          eq(documentPermissions.id, input.permissionId),
          eq(documentPermissions.documentId, input.documentId),
        ))
        .limit(1)
      if (!existing) return false

      await transaction
        .update(documentPermissions)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(documentPermissions.id, existing.id))
      await transaction.insert(activityLogs).values({
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: 'document.permission_updated',
        resourceType: 'document',
        resourceId: input.documentId,
        metadata: { userId: existing.userId, role: input.role },
      })
      return true
    })
    if (!result) return null
    return (await this.listPermissions(input.documentId)).find((item) => item.id === input.permissionId) ?? null
  }

  async removePermission(input: {
    workspaceId: string
    documentId: string
    permissionId: string
    actorId: string
  }) {
    return this.database.db.transaction(async (transaction) => {
      const [existing] = await transaction
        .select({ id: documentPermissions.id, userId: documentPermissions.userId })
        .from(documentPermissions)
        .where(and(
          eq(documentPermissions.id, input.permissionId),
          eq(documentPermissions.documentId, input.documentId),
        ))
        .limit(1)
      if (!existing) return false

      await transaction.delete(documentPermissions).where(eq(documentPermissions.id, existing.id))
      await transaction.insert(activityLogs).values({
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: 'document.permission_removed',
        resourceType: 'document',
        resourceId: input.documentId,
        metadata: { userId: existing.userId },
      })
      return true
    })
  }

  private toSummary(record: {
    id: string
    title: string
    description: string | null
    workspaceId: string
    folderId: string | null
    createdById: string
    isArchived: boolean
    isFavorite: boolean
    collaboratorCount: number
    createdAt: Date
    updatedAt: Date
    permissionRole: DocumentPermissionRole | null
    canEdit: boolean
    canManageSharing: boolean
    canDelete: boolean
    creator: PublicUserSummary
  }): DocumentSummary {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      workspaceId: record.workspaceId,
      folderId: record.folderId,
      createdById: record.createdById,
      createdBy: record.creator,
      isArchived: record.isArchived,
      isFavorite: record.isFavorite,
      collaboratorCount: Number(record.collaboratorCount),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      permissionRole: record.permissionRole,
      canEdit: record.canEdit,
      canManageSharing: record.canManageSharing,
      canDelete: record.canDelete,
    }
  }

  private toVersion(record: {
    id: string
    documentId: string
    versionNumber: number
    title: string
    content: DocumentJson
    createdById: string
    createdAt: Date
    changeSummary: string | null
    creator: PublicUserSummary
  }): DocumentVersionSummary {
    return {
      ...record,
      createdBy: record.creator,
      createdAt: record.createdAt.toISOString(),
    }
  }
}
