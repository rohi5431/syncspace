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
