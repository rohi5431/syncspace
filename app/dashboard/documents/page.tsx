import type { Metadata } from 'next'
import { DocumentsManager } from '@/components/documents/documents-manager'

export const metadata: Metadata = {
  title: 'My Documents | SyncSpace',
  description: 'Manage, search, and collaborate on your workspace documents.',
}

export default function DocumentsPage() {
  return <DocumentsManager />
}
