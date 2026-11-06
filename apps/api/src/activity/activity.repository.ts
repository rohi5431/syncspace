import { Injectable } from '@nestjs/common'
import { and, count, desc, eq, exists, ne, or, sql } from 'drizzle-orm'
import type { PaginatedResult, WorkspaceActivityItem, WorkspaceRole } from '@syncspace/contracts'
import { DatabaseService } from '../database/database.service'
import { activityLogs, documentPermissions, documents, folders, users } from '../database/schema'
import type { ActivityQueryDto } from './activity.dto'

@Injectable()
export class ActivityRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    query: ActivityQueryDto,
  ): Promise<PaginatedResult<WorkspaceActivityItem>> {
    const conditions = [eq(activityLogs.workspaceId, workspaceId)]
    if (query.resourceType) conditions.push(eq(activityLogs.resourceType, query.resourceType))
    if (role === 'MEMBER') {
      const canSeeDocumentActivity = exists(this.database.db
        .select({ id: documents.id })
        .from(documents)
        .where(and(
          eq(documents.id, activityLogs.resourceId),
          or(
            eq(documents.createdById, userId),
            exists(this.database.db
              .select({ id: documentPermissions.id })
              .from(documentPermissions)
              .where(and(
                eq(documentPermissions.documentId, documents.id),
                eq(documentPermissions.userId, userId),
              ))),
          ),
        )))
      conditions.push(or(ne(activityLogs.resourceType, 'document'), canSeeDocumentActivity)!)
    }
    const where = and(...conditions)
    const [totalRecord] = await this.database.db
      .select({ total: count() })
      .from(activityLogs)
      .where(where)
    const records = await this.database.db
      .select({
        id: activityLogs.id,
        workspaceId: activityLogs.workspaceId,
        actorId: activityLogs.actorId,
        action: activityLogs.action,
        resourceType: activityLogs.resourceType,
        resourceId: activityLogs.resourceId,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.createdAt,
        actor: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
        documentName: documents.title,
        folderName: folders.name,
      })
      .from(activityLogs)
      .innerJoin(users, eq(activityLogs.actorId, users.id))
      .leftJoin(documents, and(
        eq(activityLogs.resourceType, 'document'),
        eq(activityLogs.resourceId, documents.id),
      ))
      .leftJoin(folders, and(
        eq(activityLogs.resourceType, 'folder'),
        eq(activityLogs.resourceId, folders.id),
      ))
      .where(where)
      .orderBy(desc(activityLogs.createdAt), desc(activityLogs.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize)

    const total = Number(totalRecord?.total ?? 0)
    return {
      items: records.map((record) => {
        const metadata = record.metadata ?? {}
        const metadataName = metadata.name ?? metadata.title ?? metadata.documentTitle
        return {
          id: record.id,
          workspaceId: record.workspaceId,
          actorId: record.actorId,
          action: record.action,
          resourceType: record.resourceType,
          resourceId: record.resourceId,
          resourceName: record.documentName ?? record.folderName ?? (typeof metadataName === 'string' ? metadataName : null),
          metadata,
          createdAt: record.createdAt.toISOString(),
          actor: record.actor,
        }
      }),
      total,
      page: query.page,
      pageSize: query.pageSize,
      pageCount: Math.ceil(total / query.pageSize),
    }
  }
}
