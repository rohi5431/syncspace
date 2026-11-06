import type { Metadata } from 'next'
import { DocumentsPage } from '@/components/documents/documents-page'

export const metadata: Metadata = { title: 'Documents' }

export default async function WorkspaceDocumentsPage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const params = await searchParams
  const search = Array.isArray(params.search) ? params.search[0] ?? '' : params.search ?? ''
  return <DocumentsPage initialSearch={search} />
}
