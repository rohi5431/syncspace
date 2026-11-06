import type { Metadata } from 'next'
import { TasksManager } from '@/components/tasks/tasks-manager'

export const metadata: Metadata = {
  title: 'Task Management | SyncSpace',
  description: 'Track and assign deliverables using List, Kanban, and Calendar views.',
}

export default function TasksPage() {
  return <TasksManager />
}
