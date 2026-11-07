export interface AuthenticatedRequest {
  user: {
    id: string
    email: string
    name: string
    initials: string
    tone: string
    role: string
    platformRole: string
    sessionId?: string
  }
}
