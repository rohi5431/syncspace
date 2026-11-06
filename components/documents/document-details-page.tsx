'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import type { DocumentDetail, DocumentPermissionSummary, DocumentVersionSummary, PaginatedResult } from '@syncspace/contracts'
import { ArrowLeft, CalendarDays, FileText, History, Share2 } from 'lucide-react'
import { DocumentShareDialog } from '@/components/documents/document-share-dialog'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/providers/toast-provider'
import { ApiError, apiFetcher, apiRequest, getInitials, useAuth } from '@/lib/api-client'
import { formatFullDate, formatRelativeDate } from '@/lib/date-format'

export function DocumentDetailsPage({ documentId }: { documentId: string }) {
  const { user } = useAuth()
  const [sharingOpen, setSharingOpen] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const toast = useToast()
  const { data: document, error, isLoading, mutate } = useSWR<DocumentDetail, ApiError>(`/api/documents/${documentId}`, apiFetcher)
  const versionsKey = document ? `/api/documents/${documentId}/versions?page=1&pageSize=20` : null
  const permissionsKey = document?.canManageSharing ? `/api/documents/${documentId}/permissions` : null
  const { data: versions, error: versionsError, isLoading: versionsLoading } = useSWR<PaginatedResult<DocumentVersionSummary>, ApiError>(versionsKey, apiFetcher)
  const { data: permissions } = useSWR<DocumentPermissionSummary[]>(permissionsKey, apiFetcher)
  const versionKey = selectedVersionId ? `/api/documents/${documentId}/versions/${selectedVersionId}` : null
  const { data: selectedVersion, error: selectedVersionError } = useSWR<DocumentVersionSummary, ApiError>(versionKey, apiFetcher)

  const archiveDocument = async () => {
    try {
      await apiRequest(`/documents/${documentId}`, { method: 'PATCH', body: { isArchived: true } })
      await mutate()
      toast('Document archived.')
    } catch (cause) {
      toast(cause instanceof ApiError ? cause.message : 'Could not archive this document.')
    }
  }

  if (isLoading) return <p className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500" role="status">Loading document…</p>
  if (error || !document) return <section className="rounded-xl border border-red-200 bg-white p-6"><h1 className="text-lg font-semibold text-gray-900">Document unavailable</h1><p className="mt-2 text-sm text-red-700">{error?.message ?? 'This document could not be found.'}</p><Link href="/dashboard/documents" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700">Back to documents</Link></section>

  const roleLabel = document.createdById === user?.id ? 'Creator' : document.permissionRole ?? (document.canManageSharing ? 'Workspace admin' : 'Viewer')
  const previewText = extractDocumentText(document.content)
  const relatedPermissions = permissions ?? []

  return <>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/dashboard/documents" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"><ArrowLeft aria-hidden="true" className="size-4" />All documents</Link>
      <div className="flex items-center gap-2">
        {document.canManageSharing && <Button type="button" variant="outline" onClick={() => setSharingOpen(true)}><Share2 data-icon="inline-start" />Share</Button>}
        {document.canEdit && <Button type="button" variant="outline" onClick={() => void archiveDocument()}>Archive</Button>}
      </div>
    </div>

    <header className="mt-7 border-b border-gray-200 pb-6">
      <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-indigo-600"><FileText aria-hidden="true" className="size-5" /></span><div className="min-w-0"><h1 className="break-words text-2xl font-semibold tracking-[-0.04em] text-gray-950 sm:text-[30px]">{document.title}</h1><p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-gray-500">{document.description || 'No description added.'}</p></div></div>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-2"><UserAvatar initials={getInitials(document.createdBy.name)} name={document.createdBy.name} size="sm" tone="slate" />Created by <span className="font-medium text-gray-800">{document.createdBy.name}</span></span>
        <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-3.5" />Created {formatFullDate(document.createdAt)}</span>
        <span>Updated {formatRelativeDate(document.updatedAt)}</span>
        <span className="rounded-full border border-gray-200 px-2.5 py-1 font-medium text-gray-600">{roleLabel}</span>
      </div>
    </header>

    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section aria-labelledby="editor-title" className="min-h-[420px] rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3"><div><h2 id="editor-title" className="text-sm font-semibold text-gray-900">Document</h2><p className="mt-0.5 text-xs text-gray-500">Editor surface prepared for the next phase</p></div><span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-500">JSON content</span></div>
        {previewText ? <div className="whitespace-pre-wrap px-5 py-6 text-sm leading-7 text-gray-700">{previewText}</div> : <div className="grid min-h-[340px] place-items-center px-6 text-center"><div><FileText aria-hidden="true" className="mx-auto size-7 text-gray-300" /><p className="mt-3 text-sm font-medium text-gray-700">Your document is ready</p><p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">The content is stored as JSON. Rich-text editing will be added in the next phase.</p></div></div>}
      </section>

      <aside className="flex flex-col gap-4">
        <section className="rounded-xl border border-gray-200 bg-white p-4"><div className="flex items-center gap-2"><Share2 aria-hidden="true" className="size-4 text-gray-400" /><h2 className="text-sm font-semibold text-gray-900">Sharing</h2></div>{document.canManageSharing ? <><p className="mt-2 text-xs leading-5 text-gray-500">{relatedPermissions.length} teammate{relatedPermissions.length === 1 ? '' : 's'} have explicit access.</p><Button type="button" variant="outline" onClick={() => setSharingOpen(true)} className="mt-3 w-full">Manage access</Button></> : <p className="mt-2 text-xs leading-5 text-gray-500">Your access is {document.permissionRole?.toLowerCase() ?? 'granted by workspace role'}.</p>}</section>
        <section className="rounded-xl border border-gray-200 bg-white p-4"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><History aria-hidden="true" className="size-4 text-gray-400" /><h2 className="text-sm font-semibold text-gray-900">Version history</h2></div><span className="text-[10px] text-gray-400">{versions?.total ?? 0} versions</span></div>
          {versionsLoading && <p className="mt-4 text-xs text-gray-500" role="status">Loading history…</p>}
          {versionsError && <p className="mt-4 text-xs text-red-600" role="alert">{versionsError.message}</p>}
          {!versionsLoading && !versionsError && <ol className="mt-3 divide-y divide-gray-100">{(versions?.items ?? []).map((version) => <li key={version.id} className="py-3 first:pt-1 last:pb-1"><button type="button" onClick={() => setSelectedVersionId(version.id)} className="w-full text-left"><span className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-gray-800">Version {version.versionNumber}</span><span className="text-[10px] text-gray-400">{formatRelativeDate(version.createdAt)}</span></span><span className="mt-1 block truncate text-[11px] text-gray-500">{version.changeSummary || `Saved by ${version.createdBy.name}`}</span></button></li>)}</ol>}
          {!versionsLoading && !versionsError && !versions?.items.length && <p className="mt-3 text-xs leading-5 text-gray-500">Snapshots will appear when authorized content updates are saved.</p>}
        </section>
      </aside>
    </div>

    <DocumentShareDialog document={document} open={sharingOpen} onClose={() => setSharingOpen(false)} />
    {selectedVersionId && <VersionSnapshot version={selectedVersion} error={selectedVersionError?.message} onClose={() => setSelectedVersionId(null)} />}
  </>
}

function VersionSnapshot({ version, error, onClose }: { version?: DocumentVersionSummary; error?: string; onClose: () => void }) {
  return <Modal open onClose={onClose} title={`Version ${version?.versionNumber ?? ''} snapshot`} description={version ? `Saved by ${version.createdBy.name} · ${formatFullDate(version.createdAt)}` : 'Read-only document snapshot.'} size="md">
    {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : version ? <pre className="max-h-[60vh] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-5 text-gray-700">{JSON.stringify(version.content, null, 2)}</pre> : <p className="text-sm text-gray-500" role="status">Loading version snapshot…</p>}
    <div className="mt-4 flex justify-end"><Button type="button" variant="outline" onClick={onClose}>Close</Button></div>
  </Modal>
}

function extractDocumentText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  if (Array.isArray(value)) return value.map(extractDocumentText).filter(Boolean).join('\n')
  const record = value as Record<string, unknown>
  if (typeof record.text === 'string') return record.text
  if (Array.isArray(record.content)) return record.content.map(extractDocumentText).filter(Boolean).join('\n')
  return ''
}
