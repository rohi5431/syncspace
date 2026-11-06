import type { Metadata } from 'next'
import { DocumentDetailsPage } from '@/components/documents/document-details-page'

export const metadata: Metadata = { title: 'Document details' }

export default async function DocumentDetailsRoute({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params
  return <DocumentDetailsPage documentId={documentId} />
}
