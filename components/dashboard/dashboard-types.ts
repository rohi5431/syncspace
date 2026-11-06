export interface WorkspaceSummary {
  id: string
  name: string
  slug: string
  plan: string
  seatQuota: number
  currentSeats: number
}

export interface StatItem {
  total: number
  trendPercent?: string
  changeNote?: string
  active?: number
  completed?: number
  pending?: number
  overdue?: number
  online?: number
}

export interface DocumentSummary {
  id: string
  title: string
  category: string
  authorName: string
  initials: string
  tone: 'indigo' | 'emerald' | 'amber' | 'slate' | 'pink'
  updatedAt: string
  collaborators: number
  accessLevel: 'Workspace Edit' | 'Public View' | 'Restricted'
  starred: boolean
  type?: string
  editor?: string
  content?: string
  folderId?: string | null
}

export interface ProjectSummary {
  id: string
  title: string
  description: string
  progress: number
  dueDate: string
  tone: 'indigo' | 'emerald' | 'amber' | 'slate' | 'pink'
  status: 'In Progress' | 'On Track' | 'At Risk' | 'Completed'
  members: string[]
  taskCount: number
  template?: string
}

export interface TaskSummary {
  id: string
  title: string
  projectName: string
  projectTone: string
  completed: boolean
  dueDate: string
  priority: 'High' | 'Medium' | 'Low'
  assignee: {
    name: string
    initials: string
  }
}

export interface TeamMemberSummary {
  id: string
  name: string
  email: string
  initials: string
  role: string
  tone: 'indigo' | 'emerald' | 'amber' | 'slate' | 'pink'
  online: boolean
  lastActive: string
  currentTask?: string
}

export interface ActivitySummary {
  id: string
  name: string
  initials: string
  tone: 'indigo' | 'emerald' | 'amber' | 'slate' | 'pink'
  action: string
  target: string
  category?: 'document' | 'project' | 'task' | 'team'
  createdAt: string
}

export interface StorageSummary {
  usedBytes: number
  totalBytes: number
  usedFormatted: string
  totalFormatted: string
  percent: number
}

export interface CollaborationSummary {
  status: string
  latencyMs: number
  gatewayUrl: string
  activeRooms: number
  connectedClients: number
  synced: boolean
}

export interface DashboardData {
  workspace: WorkspaceSummary
  stats: {
    documents: StatItem
    projects: StatItem
    tasks: StatItem
    team: StatItem
  }
  recentDocuments: DocumentSummary[]
  projects: ProjectSummary[]
  tasks: TaskSummary[]
  activities: ActivitySummary[]
  teamMembers: TeamMemberSummary[]
  storage: StorageSummary
  collaboration: CollaborationSummary
}
