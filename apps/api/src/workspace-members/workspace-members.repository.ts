import { Injectable } from '@nestjs/common'
import { and, asc, count, eq, inArray } from 'drizzle-orm'
import type { PaginatedResult, PublicUserSummary, WorkspaceMemberSummary, WorkspaceRole } from '@syncspace/contracts'
import { DatabaseService } from '../database/database.service'
import { activityLogs, documentPermissions, documents, users, workspaceMembers } from '../database/schema'

@Injectable()
export class WorkspaceMembersRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(workspaceId: string, page: number, pageSize: number): Promise<PaginatedResult<WorkspaceMemberSummary>> {
    const where = eq(workspaceMembers.workspaceId, workspaceId)
    const [totalRecord] = await this.database.db
      .select({ total: count() })
      .from(workspaceMembers)
      .where(where)
    const records = await this.database.db
      .select({
        id: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.joinedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(where)
      .orderBy(asc(workspaceMembers.joinedAt), asc(users.name))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    const total = Number(totalRecord?.total ?? 0)
    return {
      items: records.map((record) => ({ ...record, joinedAt: record.joinedAt.toISOString() })),
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    }
  }

  async findById(workspaceId: string, memberId: string) {
    const [record] = await this.database.db
      .select({
        id: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.joinedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.id, memberId)))
      .limit(1)
    return record ? { ...record, joinedAt: record.joinedAt.toISOString() } : null
  }

  async findByWorkspaceUser(workspaceId: string, userId: string) {
    const [record] = await this.database.db
      .select({ id: workspaceMembers.id, userId: workspaceMembers.userId, role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
      .limit(1)
    return record ?? null
  }

  async add(input: { workspaceId: string; userId: string; actorId: string; role: WorkspaceRole }) {
    const created = await this.database.db.transaction(async (transaction) => {
      const [membership] = await transaction
        .insert(workspaceMembers)
        .values({ workspaceId: input.workspaceId, userId: input.userId, role: input.role })
        .returning({ id: workspaceMembers.id })
      await transaction.insert(activityLogs).values({
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: 'member.added',
        resourceType: 'member',
        resourceId: input.userId,
        metadata: { userId: input.userId },
      })
      return membership
    })
    return this.findById(input.workspaceId, created.id)
  }

  async updateRole(input: { workspaceId: string; memberId: string; actorId: string; role: WorkspaceRole }) {
    return this.database.db.transaction(async (transaction) => {
      const [current] = await transaction
        .select({ userId: workspaceMembers.userId, role: workspaceMembers.role })
        .from(workspaceMembers)
        .where(and(eq(workspaceMembers.id, input.memberId), eq(workspaceMembers.workspaceId, input.workspaceId)))
        .limit(1)
      if (!current) return null

      const [updated] = await transaction
        .update(workspaceMembers)
        .set({ role: input.role })
        .where(and(eq(workspaceMembers.id, input.memberId), eq(workspaceMembers.workspaceId, input.workspaceId)))
        .returning({ id: workspaceMembers.id })
      if (!updated) return null

      await transaction.insert(activityLogs).values({
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: 'member.role_updated',
        resourceType: 'member',
        resourceId: current.userId,
        metadata: { userId: current.userId, previousRole: current.role, role: input.role },
      })
      return updated
    }).then((record) => record ? this.findById(input.workspaceId, record.id) : null)
  }

  async remove(input: { workspaceId: string; memberId: string; actorId: string }) {
    return this.database.db.transaction(async (transaction) => {
      const [current] = await transaction
        .select({ userId: workspaceMembers.userId, name: users.name, email: users.email })
        .from(workspaceMembers)
        .innerJoin(users, eq(workspaceMembers.userId, users.id))
        .where(and(eq(workspaceMembers.id, input.memberId), eq(workspaceMembers.workspaceId, input.workspaceId)))
        .limit(1)
      if (!current) return false

      const workspaceDocumentIds = transaction
        .select({ id: documents.id })
        .from(documents)
        .where(eq(documents.workspaceId, input.workspaceId))
      await transaction.delete(documentPermissions).where(and(
        eq(documentPermissions.userId, current.userId),
        inArray(documentPermissions.documentId, workspaceDocumentIds),
      ))
      await transaction
        .delete(workspaceMembers)
        .where(and(eq(workspaceMembers.id, input.memberId), eq(workspaceMembers.workspaceId, input.workspaceId)))
      await transaction.insert(activityLogs).values({
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: 'member.removed',
        resourceType: 'member',
        resourceId: current.userId,
        metadata: { userId: current.userId, name: current.name, email: current.email },
      })
      return true
    })
  }
}
