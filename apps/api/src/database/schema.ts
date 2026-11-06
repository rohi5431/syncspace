import { desc, sql } from 'drizzle-orm'
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  jsonb,
  customType,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const workspaceRole = pgEnum('workspace_role', ['OWNER', 'ADMIN', 'MEMBER'])

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name').notNull(),
    email: varchar('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('users_email_lower_uidx').on(sql`lower(${table.email})`)],
)

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: workspaceRole('role').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('workspace_members_workspace_user_key').on(table.workspaceId, table.userId),
    index('workspace_members_user_id_idx').on(table.userId),
  ],
)

export const authSessions = pgTable(
  'auth_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refreshTokenHash: text('refresh_token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('auth_sessions_refresh_token_hash_key').on(table.refreshTokenHash)],
)

export type DocumentPermissionRole = 'VIEWER' | 'EDITOR'
export type DocumentJson = Record<string, unknown>

export const folders = pgTable(
  'folders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    parentFolderId: uuid('parent_folder_id').references(
      (): AnyPgColumn => folders.id,
      { onDelete: 'set null' },
    ),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('folders_workspace_parent_idx').on(table.workspaceId, table.parentFolderId),
    uniqueIndex('folders_workspace_root_name_uidx')
      .on(table.workspaceId, sql`lower(${table.name})`)
      .where(sql`${table.parentFolderId} IS NULL`),
    uniqueIndex('folders_workspace_parent_name_uidx')
      .on(table.workspaceId, table.parentFolderId, sql`lower(${table.name})`)
      .where(sql`${table.parentFolderId} IS NOT NULL`),
    check('folders_name_length_check', sql`length(trim(${table.name})) BETWEEN 1 AND 120`),
  ],
)

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    content: jsonb('content')
      .$type<DocumentJson>()
      .notNull()
      .default({ type: 'doc', content: [] }),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    folderId: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    isArchived: boolean('is_archived').notNull().default(false),
    isDeleted: boolean('is_deleted').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('documents_workspace_updated_idx')
      .on(table.workspaceId, desc(table.updatedAt), desc(table.id))
      .where(sql`${table.isArchived} = false AND ${table.isDeleted} = false`),
    index('documents_workspace_created_idx')
      .on(table.workspaceId, desc(table.createdAt), desc(table.id))
      .where(sql`${table.isArchived} = false AND ${table.isDeleted} = false`),
    index('documents_workspace_folder_updated_idx')
      .on(table.workspaceId, table.folderId, desc(table.updatedAt), desc(table.id))
      .where(sql`${table.isArchived} = false AND ${table.isDeleted} = false`),
    index('documents_workspace_title_search_idx')
      .on(table.workspaceId, sql`lower(${table.title}) text_pattern_ops`)
      .where(sql`${table.isArchived} = false AND ${table.isDeleted} = false`),
    check('documents_title_length_check', sql`length(trim(${table.title})) BETWEEN 1 AND 200`),
  ],
)

export const documentPermissions = pgTable(
  'document_permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').$type<DocumentPermissionRole>().notNull(),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('document_permissions_document_user_key').on(table.documentId, table.userId),
    index('document_permissions_user_idx').on(table.userId, table.documentId),
    check('document_permissions_role_check', sql`${table.role} IN ('VIEWER', 'EDITOR')`),
  ],
)

export const documentVersions = pgTable(
  'document_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    content: jsonb('content').$type<DocumentJson>().notNull(),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    changeSummary: text('change_summary'),
  },
  (table) => [
    uniqueIndex('document_versions_document_version_key').on(table.documentId, table.versionNumber),
    check('document_versions_version_number_check', sql`${table.versionNumber} > 0`),
  ],
)

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    action: varchar('action', { length: 80 }).notNull(),
    resourceType: varchar('resource_type', { length: 40 }).notNull(),
    resourceId: uuid('resource_id'),
    metadata: jsonb('metadata').$type<DocumentJson>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('activity_logs_workspace_created_idx').on(
      table.workspaceId,
      desc(table.createdAt),
      desc(table.id),
    ),
  ],
)

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
})

export const documentSnapshots = pgTable(
  'document_snapshots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    snapshotData: bytea('snapshot_data').notNull(),
    stateVector: bytea('state_vector').notNull(),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updateCount: integer('update_count').notNull().default(0),
  },
  (table) => [
    index('document_snapshots_document_created_idx').on(
      table.documentId,
      desc(table.createdAt),
      desc(table.id),
    ),
    check('document_snapshots_update_count_check', sql`${table.updateCount} >= 0`),
  ],
)

export const documentUpdates = pgTable(
  'document_updates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    updateData: bytea('update_data').notNull(),
    updateHash: varchar('update_hash', { length: 64 }).notNull(),
    actorId: uuid('actor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('document_updates_document_hash_key').on(table.documentId, table.updateHash),
    index('document_updates_document_created_idx').on(
      table.documentId,
      table.createdAt,
      table.id,
    ),
  ],
)

export const documentFavorites = pgTable(
  'document_favorites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('document_favorites_document_user_key').on(table.documentId, table.userId),
    index('document_favorites_user_created_idx').on(table.userId, desc(table.createdAt)),
  ],
)
