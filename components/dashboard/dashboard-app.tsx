'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import type { DocumentSummary, FolderSummary, PaginatedResult, WorkspaceActivityItem, WorkspaceMemberSummary } from '@syncspace/contracts'
import { Activity, ArrowRight, FileText, FolderClosed, Plus, UsersRound } from 'lucide-react'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { WorkspaceMembersPanel } from '@/components/dashboard/workspace-members-panel'
import { WorkspaceSettingsDialog } from '@/components/dashboard/workspace-settings-dialog'
import { DocumentFormDialog } from '@/components/documents/document-dialogs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import { useWorkspaceContext } from '@/components/dashboard/workspace-provider'
import { ApiError, apiFetcher, apiRequest } from '@/lib/api-client'
import { formatRelativeDate } from '@/lib/date-format'
import { refreshWorkspaceData } from '@/lib/workspace-data'

export function DashboardApp() {
  const { activeWorkspace, isLoading: workspacesLoading, error: workspaceError } = useWorkspaceContext()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false)
  const toast = useToast()
  const router = useRouter()
  const workspaceId = activeWorkspace?.id
  const documentsKey = workspaceId ? `/api/workspaces/${workspaceId}/documents?page=1&pageSize=5&sortBy=updatedAt&sortDirection=desc` : null
  const foldersKey = workspaceId ? `/api/workspaces/${workspaceId}/folders` : null
  const activityKey = workspaceId ? `/api/workspaces/${workspaceId}/activity?page=1&pageSize=5` : null
  const membersKey = workspaceId ? `/api/workspaces/${workspaceId}/members?page=1&pageSize=5` : null
  const { data: documents, error: documentsError, isLoading: documentsLoading } = useSWR<PaginatedResult<DocumentSummary>, ApiError>(documentsKey, apiFetcher)
  const { data: folders, error: foldersError } = useSWR<FolderSummary[], ApiError>(foldersKey, apiFetcher)
  const { data: activity, error: activityError } = useSWR<PaginatedResult<WorkspaceActivityItem>, ApiError>(activityKey, apiFetcher)
  const { data: members, error: membersError } = useSWR<PaginatedResult<WorkspaceMemberSummary>, ApiError>(membersKey, apiFetcher)

  const createDocument = async (values: { title: string; description: string; folderId: string | null }) => {
    if (!workspaceId) return
    const document = await apiRequest<DocumentSummary>(`/workspaces/${workspaceId}/documents`, {
      method: 'POST',
      body: { title: values.title, description: values.description || undefined, folderId: values.folderId },
    })
    await refreshWorkspaceData(workspaceId)
    toast(`“${document.title}” created.`)
    router.push(`/dashboard/documents/${document.id}`)
  }

  if (workspacesLoading) return <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500" role="status">Loading your workspace…</div>
  if (workspaceError) return <div className="rounded-xl border border-red-200 bg-white p-5 text-sm text-red-700" role="alert">{workspaceError.message}</div>
  if (!activeWorkspace) return <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center"><h1 className="text-xl font-semibold tracking-tight text-gray-900">Create a workspace to get started</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Workspaces keep your documents, members, and activity organized in one place. Use the workspace switcher to create your first one.</p></section>

  const stats = [
    { label: 'Documents', value: documents?.total ?? 0, note: 'Available in this workspace', icon: FileText },
    { label: 'Folders', value: folders?.length ?? 0, note: 'Nested workspace folders', icon: FolderClosed },
    { label: 'Members', value: members?.total ?? 0, note: 'People with workspace access', icon: UsersRound },
    { label: 'Activity', value: activity?.total ?? 0, note: 'Recent workspace events', icon: Activity },
  ]
  const dataError = documentsError ?? foldersError ?? activityError ?? membersError

  return <>
    <div id="overview" className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="min-w-0"><p className="text-xs font-medium text-gray-500">Workspace overview</p><h1 className="mt-2 truncate text-2xl font-semibold tracking-[-0.04em] text-gray-950 sm:text-[30px]">{activeWorkspace.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">{activeWorkspace.description || `A shared home for ${activeWorkspace.name} documents and team activity.`}</p></div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {(activeWorkspace.role === 'OWNER' || activeWorkspace.role === 'ADMIN') && <Button type="button" variant="outline" onClick={() => setSettingsOpen(true)} className="h-10 rounded-lg border-gray-200 bg-white px-3.5 text-gray-700">Workspace settings</Button>}
        <Button type="button" onClick={() => setCreateDocumentOpen(true)} className="h-10 rounded-lg bg-indigo-600 px-3.5 text-white hover:bg-indigo-700"><Plus data-icon="inline-start" />Create document</Button>
      </div>
    </div>

    {dataError && <p className="mt-5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700" role="alert">Some workspace data could not be loaded: {dataError.message}</p>}
    <section aria-label="Workspace statistics" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, note, icon: Icon }) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium text-gray-500">{label}</p><Icon aria-hidden="true" className="size-4 text-gray-400" /></div><div className="mt-3 flex items-end justify-between gap-2"><span className="text-[26px] font-semibold leading-none tracking-tight text-gray-950">{documentsLoading && label === 'Documents' ? '—' : value}</span><span className="text-right text-[10px] text-gray-400">{note}</span></div></div>)}
    </section>

    <section id="recent-documents" className="mt-9 scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold tracking-tight text-gray-950">Recently updated</h2><p className="mt-1 text-xs text-gray-500">Documents you can access, ordered by latest update.</p></div><Link href="/dashboard/documents" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">All documents <ArrowRight aria-hidden="true" className="size-3.5" /></Link></div>
      {documentsLoading ? <p className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500" role="status">Loading documents…</p> : documents?.items.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{documents.items.map((document) => <Link key={document.id} href={`/dashboard/documents/${document.id}`} className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"><span className="grid size-9 place-items-center rounded-lg border border-gray-100 bg-gray-50 text-indigo-600"><FileText aria-hidden="true" className="size-[17px]" /></span><h3 className="mt-4 truncate text-sm font-semibold text-gray-900">{document.title}</h3><p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-gray-500">{document.description || 'No description yet.'}</p><div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3"><span className="truncate text-[11px] text-gray-400">Updated {formatRelativeDate(document.updatedAt)}</span><span className="truncate text-[11px] text-gray-500">{document.createdBy.name}</span></div></Link>)}</div> : <div className="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center"><FileText aria-hidden="true" className="mx-auto size-6 text-gray-300" /><p className="mt-3 text-sm font-medium text-gray-700">No documents yet</p><p className="mt-1 text-xs text-gray-500">Create a document to start building your workspace library.</p><Button type="button" onClick={() => setCreateDocumentOpen(true)} className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700">Create document</Button></div>}
    </section>

    <div className="mt-9 grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
      <section id="activity" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-5"><div className="mb-3"><h2 className="text-base font-semibold tracking-tight text-gray-950">Recent activity</h2><p className="mt-1 text-xs text-gray-500">Updates from members and documents you can access.</p></div><ActivityFeed items={activity?.items ?? []} /></section>
      <div id="team" className="scroll-mt-24"><WorkspaceMembersPanel workspace={activeWorkspace} /></div>
    </div>

    <WorkspaceSettingsDialog key={activeWorkspace.id} workspace={activeWorkspace} open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    <DocumentFormDialog mode="create" open={createDocumentOpen} folders={folders ?? []} selectedFolderId={null} onClose={() => setCreateDocumentOpen(false)} onSave={createDocument} />
  </>
}
