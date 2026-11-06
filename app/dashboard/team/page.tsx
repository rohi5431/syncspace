import type { Metadata } from 'next'
import { TeamManager } from '@/components/team/team-manager'

export const metadata: Metadata = {
  title: 'Team Members | SyncSpace',
  description: 'Manage workspace collaborators, access permissions, and roles.',
}

export default function TeamPage() {
  return <TeamManager />
}
