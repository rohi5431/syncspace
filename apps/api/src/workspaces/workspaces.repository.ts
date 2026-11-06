import { Injectable } from '@nestjs/common'
import { and, desc, eq, exists } from 'drizzle-orm'
import type { WorkspaceRole, WorkspaceSummary } from '@syncspace/contracts'
import { DatabaseService } from '../database/database.service'
import { activityLogs, workspaceMembers, workspaces } from '../database/schema'

interface WorkspaceRecord {
  id: string
  name: string
  description: string | null
  ownerId: string
  role: WorkspaceRole
  createdAt: Date
  updatedAt: Date
}

@Injectable()
export class WorkspacesRepository {
  constructor(private readonly database: DatabaseService) {}

  async listForUser(userId: string): Promise<WorkspaceSummary[]> {
    const records = await this.database.db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        description: workspaces.description,
        ownerId: workspaces.ownerId,
        role: workspaceMembers.role,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, userId))
      .orderBy(desc(workspaces.updatedAt))

    return records.map((record) => this.toSummary(record))
  }

  async findForUser(workspaceId: string, userId: string): Promise<WorkspaceSummary | null> {
    const [record] = await this.database.db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        description: workspaces.description,
        ownerId: workspaces.ownerId,
        role: workspaceMembers.role,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(and(eq(workspaces.id, workspaceId), eq(workspaceMembers.userId, userId)))
      .limit(1)

    return record ? this.toSummary(record) : null
  }

  async getMembership(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    const [membership] = await this.database.db
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ))
      .limit(1)

    return membership?.role ?? null
  }

  async createForUser(input: {
    name: string
    description?: string | null
    ownerId: string
  }): Promise<WorkspaceSummary> {
    return this.database.db.transaction(async (transaction) => {
      const [workspace] = await transaction
        .insert(workspaces)
        .values({
          name: input.name,
          description: input.description ?? null,
          ownerId: input.ownerId,
        })
        .returning()

      const [membership] = await transaction
        .insert(workspaceMembers)
        .values({ workspaceId: workspace.id, userId: input.ownerId, role: 'OWNER' })
        .returning({ role: workspaceMembers.role })
      await transaction.insert(activityLogs).values({
        workspaceId: workspace.id,
        actorId: input.ownerId,
        action: 'workspace.created',
        resourceType: 'workspace',
        resourceId: workspace.id,
        metadata: { name: workspace.name },
      })

      return this.toSummary({ ...workspace, role: membership.role })
    })
  }

  async updateForMember(
    workspaceId: string,
    userId: string,
    input: { name?: string; description?: string | null },
  ): Promise<WorkspaceSummary | null> {
    return this.database.db.transaction(async (transaction) => {
      const memberExists = transaction
        .select({ id: workspaceMembers.id })
        .from(workspaceMembers)
        .where(and(
          eq(workspaceMembers.workspaceId, workspaces.id),
          eq(workspaceMembers.userId, userId),
        ))

      const [record] = await transaction
        .update(workspaces)
        .set({ ...input, updatedAt: new Date() })
        .where(and(eq(workspaces.id, workspaceId), exists(memberExists)))
        .returning()
      if (!record) return null

      await transaction.insert(activityLogs).values({
        workspaceId,
        actorId: userId,
        action: 'workspace.updated',
        resourceType: 'workspace',
        resourceId: workspaceId,
        metadata: { name: record.name },
      })
      const [membership] = await transaction
        .select({ role: workspaceMembers.role })
        .from(workspaceMembers)
        .where(and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ))
        .limit(1)
      return membership ? this.toSummary({ ...record, role: membership.role }) : null
    })
  }

  async deleteForMember(workspaceId: string, userId: string) {
    const memberExists = this.database.db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(and(
        eq(workspaceMembers.workspaceId, workspaces.id),
        eq(workspaceMembers.userId, userId),
      ))

    const [record] = await this.database.db
      .delete(workspaces)
      .where(and(eq(workspaces.id, workspaceId), exists(memberExists)))
      .returning({ id: workspaces.id })

    return Boolean(record)
  }

  private toSummary(record: WorkspaceRecord): WorkspaceSummary {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      ownerId: record.ownerId,
      role: record.role,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }
  }
}
