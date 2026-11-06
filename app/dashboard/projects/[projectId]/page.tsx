import type { Metadata } from 'next'
import { ProjectDetailView } from '@/components/projects/project-detail-view'

interface Props {
  params: Promise<{ projectId: string }>
}

export const metadata: Metadata = {
  title: 'Project Details | SyncSpace',
  description: 'View project deliverables, tasks, and milestone progress.',
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params
  return <ProjectDetailView projectId={projectId} />
}
