'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import type { DocumentSummary, FolderSummary, PaginatedResult, WorkspaceActivityItem, WorkspaceMemberSummary } from '@syncspace/contracts'
import { Activity, ArrowRight, FileText, FolderKanban, Heart, Plus, UsersRound } from 'lucide-react'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { WorkspaceMembersPanel } from '@/components/dashboard/workspace-members-panel'
import { WorkspaceSettingsDialog } from '@/components/dashboard/workspace-settings-dialog'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { DocumentFormDialog } from '@/components/documents/document-dialogs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import { useWorkspaceContext } from '@/components/dashboard/workspace-provider'
import { ApiError, apiFetcher, apiRequest, getInitials, useAuth } from '@/lib/api-client'
import { formatRelativeDate } from '@/lib/date-format'
import { refreshWorkspaceData } from '@/lib/workspace-data'

export function DashboardApp() {
  const { activeWorkspace, isLoading: workspacesLoading, error: workspaceError } = useWorkspaceContext()
  const { user } = useAuth()
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
  const { data: members, error: membersError, isLoading: membersLoading } = useSWR<PaginatedResult<WorkspaceMemberSummary>, ApiError>(membersKey, apiFetcher)

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

  if (workspacesLoading) return <div className="rounded-xl border border-border bg-white p-8 text-sm text-muted-foreground" role="status">Loading your workspace…</div>
  if (workspaceError) return <div className="rounded-xl border border-error/20 bg-white p-5 text-sm text-error" role="alert">{workspaceError.message}</div>
  if (!activeWorkspace) return <section className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center"><h1 className="text-xl font-semibold tracking-tight text-foreground">Create a workspace to get started</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Workspaces keep your documents, members, and activity organized in one place. Use the workspace switcher to create your first one.</p></section>

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const firstName = user?.name.trim().split(/\s+/)[0] || 'there'
  const stats = [
    { label: 'Total documents', value: documents?.total ?? 0, note: 'In this workspace', icon: FileText, accent: 'bg-accent text-primary', loading: documentsLoading },
    { label: 'Active projects', value: '—', note: 'Project tracking is not enabled', icon: FolderKanban, accent: 'bg-cyan-soft text-cyan', loading: false },
    { label: 'Team members', value: members?.total ?? 0, note: 'With workspace access', icon: UsersRound, accent: 'bg-success-soft text-success', loading: membersLoading },
    { label: 'Pending tasks', value: '—', note: 'Task tracking is not enabled', icon: Activity, accent: 'bg-pink-soft text-pink', loading: false },
  ]
  const dataError = documentsError ?? foldersError ?? activityError ?? membersError

  return <>
    <section id="overview" className="relative overflow-hidden rounded-[24px] border border-border bg-white p-5 shadow-sm sm:p-7">
      <div className="absolute -right-16 -top-20 size-64 rounded-full bg-accent/70" aria-hidden="true" />
      <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{activeWorkspace.name} · {today}</p>
          <h1 className="mt-3 truncate text-2xl font-semibold tracking-[-0.045em] text-foreground sm:text-[32px]">{greeting}, {firstName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{activeWorkspace.description || `Your ${activeWorkspace.name} workspace is ready for the next great idea.`}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {(activeWorkspace.role === 'OWNER' || activeWorkspace.role === 'ADMIN') && <Button type="button" variant="outline" onClick={() => setSettingsOpen(true)} className="h-10 bg-white">Workspace settings</Button>}
          <Button type="button" onClick={() => setCreateDocumentOpen(true)} className="h-10"><Plus aria-hidden="true" />Create document</Button>
        </div>
      </div>
    </section>

    {dataError && <p className="mt-5 rounded-xl border border-error/20 bg-white px-3 py-2.5 text-sm text-error" role="alert">Some workspace data could not be loaded: {dataError.message}</p>}
    <section aria-label="Workspace statistics" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, note, icon: Icon, accent, loading }) => <div key={label} className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">{label}</p><span className={`grid size-9 place-items-center rounded-xl ${accent}`}><Icon aria-hidden="true" className="size-4" /></span></div><div className="mt-4 flex items-end justify-between gap-2"><span className="text-[28px] font-semibold leading-none tracking-tight text-foreground">{loading ? '—' : value}</span><span className="max-w-[9rem] text-right text-[10px] leading-4 text-muted-foreground">{note}</span></div></div>)}
    </section>

    <section id="recent-documents" className="mt-8 scroll-mt-24">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div><h2 className="text-base font-semibold tracking-tight text-foreground">Recently updated</h2><p className="mt-1 text-xs text-muted-foreground">Documents you can access, ordered by latest update.</p></div>
        <Link href="/dashboard/documents" className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:underline">All documents <ArrowRight aria-hidden="true" className="size-3.5" /></Link>
      </div>
      {documentsLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading recent documents">{[0, 1, 2].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl border border-border bg-white p-4"><div className="size-9 rounded-xl bg-muted" /><div className="mt-5 h-3 w-2/3 rounded bg-muted" /><div className="mt-3 h-3 w-full rounded bg-muted" /><div className="mt-2 h-3 w-3/4 rounded bg-muted" /></div>)}</div>
      ) : documents?.items.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {documents.items.map((document) => (
            <Link key={document.id} href={`/dashboard/documents/${document.id}`} className="group rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-accent text-primary"><FileText aria-hidden="true" className="size-[17px]" /></span>
                {document.isFavorite && <span className="grid size-7 place-items-center rounded-full bg-pink-soft text-pink" title="Favorite"><Heart aria-hidden="true" className="size-3.5 fill-current" /></span>}
              </div>
              <h3 className="mt-4 truncate text-sm font-semibold text-foreground transition group-hover:text-primary">{document.title}</h3>
              <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{document.description || 'No description added.'}</p>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                <span className="flex min-w-0 items-center gap-2"><UserAvatar initials={getInitials(document.createdBy.name)} name={document.createdBy.name} size="sm" tone="slate" /><span className="min-w-0"><span className="block truncate text-[10px] font-medium text-foreground">{document.createdBy.name}</span><span className="block text-[10px] text-muted-foreground">Updated {formatRelativeDate(document.updatedAt)}</span></span></span>
                <span className="shrink-0 text-[10px] text-muted-foreground">{document.collaboratorCount} collaborators</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center"><FileText aria-hidden="true" className="mx-auto size-6 text-muted-foreground/50" /><p className="mt-3 text-sm font-medium text-foreground">No documents yet</p><p className="mt-1 text-xs text-muted-foreground">Create the first document for this workspace.</p><Button type="button" onClick={() => setCreateDocumentOpen(true)} className="mt-4">Create document</Button></div>
      )}
    </section>

    <div className="mt-8 grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
      <section id="activity" className="scroll-mt-24 rounded-2xl border border-border bg-white p-5 shadow-sm"><div className="mb-3"><h2 className="text-base font-semibold tracking-tight text-foreground">Recent activity</h2><p className="mt-1 text-xs text-muted-foreground">Updates from members and documents you can access.</p></div><ActivityFeed items={activity?.items ?? []} /></section>
      <div id="team" className="scroll-mt-24"><WorkspaceMembersPanel workspace={activeWorkspace} /></div>
    </div>

    <WorkspaceSettingsDialog key={activeWorkspace.id} workspace={activeWorkspace} open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    <DocumentFormDialog mode="create" open={createDocumentOpen} folders={folders ?? []} selectedFolderId={null} onClose={() => setCreateDocumentOpen(false)} onSave={createDocument} />
  </>
}
