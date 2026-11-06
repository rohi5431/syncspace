import type { Metadata } from 'next'
import { ProjectsManager } from '@/components/projects/projects-manager'

export const metadata: Metadata = {
  title: 'Projects | SyncSpace',
  description: 'Manage sprints, initiatives, and deliverables across your team.',
}

export default function ProjectsPage() {
  return <ProjectsManager />
}
