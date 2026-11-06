import type { Metadata } from 'next'
import { RecentDocumentsView } from '@/components/documents/recent-documents-page'

export const metadata: Metadata = {
  title: 'Recent Documents | SyncSpace',
  description: 'Quickly access documents you have recently viewed, edited, or collaborated on.',
}

export default function RecentDocumentsPage() {
  return <RecentDocumentsView />
}
