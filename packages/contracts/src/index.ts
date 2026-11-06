export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface SafeUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkspaceSummary {
  id: string
  name: string
  description: string | null
  ownerId: string
  role: WorkspaceRole
  createdAt: string
  updatedAt: string
}

export interface AuthSessionResponse {
  user: SafeUser
  accessTokenExpiresIn: number
}

export type DocumentPermissionRole = 'VIEWER' | 'EDITOR'
export type JsonObject = Record<string, unknown>

export interface PublicUserSummary {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export interface WorkspaceMemberSummary {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceRole
  joinedAt: string
  user: PublicUserSummary
}

export interface FolderSummary {
  id: string
  name: string
  workspaceId: string
  parentFolderId: string | null
  createdById: string
  createdBy: PublicUserSummary
  createdAt: string
  updatedAt: string
}

export interface DocumentSummary {
  id: string
  title: string
  description: string | null
  workspaceId: string
  folderId: string | null
  createdById: string
  createdBy: PublicUserSummary
  isArchived: boolean
  createdAt: string
  updatedAt: string
  permissionRole: DocumentPermissionRole | null
  canEdit: boolean
  canManageSharing: boolean
  canDelete: boolean
}

export interface DocumentDetail extends DocumentSummary {
  content: JsonObject
  canRead: boolean
}

export interface DocumentPermissionSummary {
  id: string
  documentId: string
  userId: string
  role: DocumentPermissionRole
  createdAt: string
  updatedAt: string
  user: PublicUserSummary
}

export interface DocumentVersionSummary {
  id: string
  documentId: string
  versionNumber: number
  title: string
  content: JsonObject
  createdById: string
  createdBy: PublicUserSummary
  createdAt: string
  changeSummary: string | null
}

export interface WorkspaceActivityItem {
  id: string
  workspaceId: string
  actorId: string
  action: string
  resourceType: string
  resourceId: string | null
  resourceName: string | null
  metadata: JsonObject
  createdAt: string
  actor: PublicUserSummary
}
