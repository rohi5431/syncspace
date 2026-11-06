import type { Metadata } from 'next'
import { DocumentsPage } from '@/components/documents/documents-page'

export const metadata: Metadata = { title: 'Documents' }

export default async function WorkspaceDocumentsPage({ searchParams }: { searchParams: Promise<{ search?: string | string[]; view?: string | string[]; create?: string | string[] }> }) {
  const params = await searchParams
  const search = Array.isArray(params.search) ? params.search[0] ?? '' : params.search ?? ''
  const requestedView = Array.isArray(params.view) ? params.view[0] : params.view
  const initialView = requestedView === 'shared' || requestedView === 'recent' || requestedView === 'favorites' ? requestedView : 'all'
  const requestedCreate = Array.isArray(params.create) ? params.create[0] : params.create
  return <DocumentsPage initialSearch={search} initialView={initialView} initialCreate={requestedCreate === '1'} />
}
