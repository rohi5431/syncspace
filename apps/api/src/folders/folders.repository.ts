import { Injectable } from '@nestjs/common'
import { and, asc, eq, sql } from 'drizzle-orm'
import type { FolderSummary, PublicUserSummary } from '@syncspace/contracts'
import { DatabaseService } from '../database/database.service'
import { activityLogs, documents, folders, users } from '../database/schema'

@Injectable()
export class FoldersRepository {
  constructor(private readonly database: DatabaseService) {}

  async listForWorkspace(workspaceId: string): Promise<FolderSummary[]> {
    const records = await this.database.db
      .select({
        id: folders.id,
        name: folders.name,
        workspaceId: folders.workspaceId,
        parentFolderId: folders.parentFolderId,
        createdById: folders.createdById,
        createdAt: folders.createdAt,
        updatedAt: folders.updatedAt,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(folders)
      .innerJoin(users, eq(folders.createdById, users.id))
      .where(eq(folders.workspaceId, workspaceId))
      .orderBy(asc(folders.name), asc(folders.id))

    return records.map((record) => this.toSummary(record))
  }

  async findInWorkspace(folderId: string, workspaceId: string) {
    const [folder] = await this.database.db
      .select({
        id: folders.id,
        name: folders.name,
        workspaceId: folders.workspaceId,
        parentFolderId: folders.parentFolderId,
        createdById: folders.createdById,
        createdAt: folders.createdAt,
        updatedAt: folders.updatedAt,
      })
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.workspaceId, workspaceId)))
      .limit(1)
    return folder ?? null
  }

  async findById(folderId: string) {
    const [folder] = await this.database.db
      .select({
        id: folders.id,
        workspaceId: folders.workspaceId,
        parentFolderId: folders.parentFolderId,
        createdById: folders.createdById,
      })
      .from(folders)
      .where(eq(folders.id, folderId))
      .limit(1)
    return folder ?? null
  }

  async findParent(folderId: string, workspaceId: string) {
    const [folder] = await this.database.db
      .select({ parentFolderId: folders.parentFolderId })
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.workspaceId, workspaceId)))
      .limit(1)
    return folder?.parentFolderId ?? null
  }

  async create(input: {
    workspaceId: string
    actorId: string
    name: string
    parentFolderId: string | null
  }): Promise<FolderSummary> {
    const created = await this.database.db.transaction(async (transaction) => {
      const [folder] = await transaction
        .insert(folders)
        .values({
          workspaceId: input.workspaceId,
          createdById: input.actorId,
          name: input.name,
          parentFolderId: input.parentFolderId,
        })
        .returning()
      await transaction.insert(activityLogs).values({
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: 'folder.created',
        resourceType: 'folder',
        resourceId: folder.id,
        metadata: { name: folder.name },
      })
      return folder
    })

    const [record] = await this.database.db
      .select({
        id: folders.id,
        name: folders.name,
        workspaceId: folders.workspaceId,
        parentFolderId: folders.parentFolderId,
        createdById: folders.createdById,
        createdAt: folders.createdAt,
        updatedAt: folders.updatedAt,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(folders)
      .innerJoin(users, eq(folders.createdById, users.id))
      .where(eq(folders.id, created.id))
      .limit(1)
    return this.toSummary(record)
  }

  async update(folderId: string, actorId: string, input: { name?: string; parentFolderId?: string | null }) {
    return this.database.db.transaction(async (transaction) => {
      const [current] = await transaction
        .select({ workspaceId: folders.workspaceId, name: folders.name })
        .from(folders)
        .where(eq(folders.id, folderId))
        .limit(1)
      if (!current) return null

      const [updated] = await transaction
        .update(folders)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(folders.id, folderId))
        .returning()
      if (!updated) return null

      await transaction.insert(activityLogs).values({
        workspaceId: current.workspaceId,
        actorId,
        action: 'folder.updated',
        resourceType: 'folder',
        resourceId: folderId,
        metadata: { name: updated.name },
      })
      return updated
    })
  }

  async delete(folderId: string, actorId: string) {
    return this.database.db.transaction(async (transaction) => {
      const [folder] = await transaction
        .select({
          id: folders.id,
          name: folders.name,
          workspaceId: folders.workspaceId,
          parentFolderId: folders.parentFolderId,
        })
        .from(folders)
        .where(eq(folders.id, folderId))
        .limit(1)
      if (!folder) return false

      await transaction
        .update(documents)
        .set({ folderId: folder.parentFolderId, updatedAt: new Date() })
        .where(eq(documents.folderId, folderId))
      await transaction
        .update(folders)
        .set({ parentFolderId: folder.parentFolderId, updatedAt: new Date() })
        .where(eq(folders.parentFolderId, folderId))
      await transaction.delete(folders).where(eq(folders.id, folderId))
      await transaction.insert(activityLogs).values({
        workspaceId: folder.workspaceId,
        actorId,
        action: 'folder.deleted',
        resourceType: 'folder',
        resourceId: folder.id,
        metadata: { name: folder.name },
      })
      return true
    })
  }

  async hasDescendant(folderId: string, potentialDescendantId: string, workspaceId: string): Promise<boolean> {
    let currentId: string | null = potentialDescendantId
    const visited = new Set<string>()
    for (let depth = 0; currentId && depth < 256; depth += 1) {
      if (currentId === folderId) return true
      if (visited.has(currentId)) return true
      visited.add(currentId)
      currentId = await this.findParent(currentId, workspaceId)
    }
    return currentId !== null
  }

  private toSummary(record: {
    id: string
    name: string
    workspaceId: string
    parentFolderId: string | null
    createdById: string
    createdAt: Date
    updatedAt: Date
    creator: PublicUserSummary
  }): FolderSummary {
    return {
      id: record.id,
      name: record.name,
      workspaceId: record.workspaceId,
      parentFolderId: record.parentFolderId,
      createdById: record.createdById,
      createdBy: record.creator,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }
  }
}
