export type DocumentItem = {
  id: string
  title: string
  category: string
  updatedAt: string
  author: string
  initials: string
  tone: 'indigo' | 'emerald' | 'amber' | 'slate'
}

export type ProjectItem = {
  id: string
  title: string
  description: string
  progress: number
  dueDate: string
  members: string[]
  tone: 'indigo' | 'emerald' | 'amber' | 'slate'
}

export const initialDocuments: DocumentItem[] = [
  {
    id: 'product-roadmap',
    title: 'Product roadmap — Q4 2026',
    category: 'Product strategy',
    updatedAt: 'Updated 24 min ago',
    author: 'Maya Chen',
    initials: 'MC',
    tone: 'indigo',
  },
  {
    id: 'launch-brief',
    title: 'Launch campaign brief',
    category: 'Marketing',
    updatedAt: 'Updated 2 hours ago',
    author: 'Rohit Kumar',
    initials: 'RK',
    tone: 'emerald',
  },
  {
    id: 'weekly-notes',
    title: 'Weekly team notes',
    category: 'Meeting notes',
    updatedAt: 'Updated yesterday',
    author: 'Jordan Lee',
    initials: 'JL',
    tone: 'amber',
  },
]

export const initialProjects: ProjectItem[] = [
  {
    id: 'website-refresh',
    title: 'Website refresh',
    description: 'A clearer story for the next chapter of SyncSpace.',
    progress: 68,
    dueDate: 'Due Nov 18',
    members: ['MC', 'JL', 'RK'],
    tone: 'indigo',
  },
  {
    id: 'mobile-app',
    title: 'Mobile app launch',
    description: 'Bring the team workspace to every screen.',
    progress: 42,
    dueDate: 'Due Dec 02',
    members: ['AS', 'RK', 'MC'],
    tone: 'emerald',
  },
  {
    id: 'onboarding',
    title: 'Customer onboarding',
    description: 'Make the first week feel effortless.',
    progress: 84,
    dueDate: 'Due Nov 12',
    members: ['JL', 'AS'],
    tone: 'amber',
  },
]

export const teamMembers = [
  { name: 'Maya Chen', role: 'Product designer', initials: 'MC', tone: 'indigo' as const, online: true },
  { name: 'Jordan Lee', role: 'Engineering lead', initials: 'JL', tone: 'emerald' as const, online: true },
  { name: 'Aisha Shah', role: 'Product manager', initials: 'AS', tone: 'amber' as const, online: true },
  { name: 'Rohit Kumar', role: 'Workspace owner', initials: 'RK', tone: 'slate' as const, online: false },
]

export const activityItems = [
  { name: 'Maya Chen', initials: 'MC', tone: 'indigo' as const, action: 'updated', target: 'Product roadmap — Q4 2026', time: '24 min ago' },
  { name: 'Jordan Lee', initials: 'JL', tone: 'emerald' as const, action: 'completed a task in', target: 'Website refresh', time: '1 hour ago' },
  { name: 'Aisha Shah', initials: 'AS', tone: 'amber' as const, action: 'commented on', target: 'Launch campaign brief', time: '3 hours ago' },
]
