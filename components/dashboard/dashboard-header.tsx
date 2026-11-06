'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import type { DocumentDetail, PaginatedResult, WorkspaceActivityItem } from '@syncspace/contracts'
import { Activity, Bell, Command, HelpCircle, Menu, Plus, Search, Settings2, UserRound, LogOut } from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { useWorkspaceContext } from '@/components/dashboard/workspace-provider'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { getInitials, apiFetcher, apiRequest, AUTH_USER_KEY, ApiError, useAuth, WORKSPACES_KEY } from '@/lib/api-client'
import { formatRelativeDate } from '@/lib/date-format'
import { useToast } from '@/components/providers/toast-provider'
import { WorkspaceSwitcher } from '@/components/dashboard/workspace-switcher'

export function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { activeWorkspace } = useWorkspaceContext()
  const displayName = user?.name ?? 'User'
  const documentId = pathname.match(/^\/dashboard\/documents\/([^/]+)$/)?.[1]
  const { data: document } = useSWR<DocumentDetail, ApiError>(documentId ? `/api/documents/${documentId}` : null, apiFetcher)
  const activityKey = activeWorkspace ? `/api/workspaces/${activeWorkspace.id}/activity?page=1&pageSize=5` : null
  const { data: activity } = useSWR<PaginatedResult<WorkspaceActivityItem>, ApiError>(activityKey, apiFetcher)

  let pageTitle = 'Overview'
  if (pathname.startsWith('/dashboard/documents/')) pageTitle = document?.title ?? 'Document'
  else if (pathname.startsWith('/dashboard/documents')) pageTitle = 'Documents'
  else if (pathname === '/settings') pageTitle = 'Settings'

  return (
    <header className="sticky top-0 z-20 flex min-h-[68px] flex-wrap items-center justify-between gap-3 border-b border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted lg:hidden" aria-label="Open navigation"><Menu aria-hidden="true" className="size-5" /></button>
        <WorkspaceSwitcher collapsed variant="header" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{activeWorkspace?.name ?? 'SyncSpace workspace'}</p>
          <h2 className="max-w-[220px] truncate text-sm font-semibold text-foreground">{pageTitle}</h2>
        </div>
        <SearchCommand />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button type="button" aria-label="Create a document" title="Create a document" onClick={() => router.push('/dashboard/documents?create=1')} className="h-9 px-3">
          <Plus aria-hidden="true" /><span className="hidden sm:inline">New</span>
        </Button>
        <ActivityPopover />
        <HelpButton />
        <div className="mx-1 hidden h-7 w-px bg-border sm:block" />
        <UserMenu displayName={displayName} email={user?.email} />
      </div>
    </header>
  )
}

function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const submitSearch = () => {
    const value = query.trim()
    router.push(value ? `/dashboard/documents?search=${encodeURIComponent(value)}` : '/dashboard/documents')
    setOpen(false)
  }

  return (
    <div>
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="h-9 w-[min(36vw,240px)] justify-start gap-2 rounded-xl border-border px-3 text-muted-foreground shadow-none hover:bg-surface-muted sm:w-[240px]">
        <Search aria-hidden="true" />
        <span className="flex-1 truncate text-left text-xs">Search documents</span>
        <kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[9px] text-muted-foreground sm:inline-flex"><Command aria-hidden="true" className="size-2.5" />K</kbd>
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Search documents" description="Find an accessible workspace document by its title." size="md">
        <form onSubmit={(event) => { event.preventDefault(); submitSearch() }} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="workspace-document-search">Document title</FieldLabel>
              <Input
                id="workspace-document-search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
                }}
                placeholder="Search by title"
              />
            </Field>
          </FieldGroup>
          <div className="flex justify-end"><Button type="submit"><Search aria-hidden="true" />Search</Button></div>
        </form>
      </Modal>
    </div>
  )
}

function ActivityPopover() {
  const { activeWorkspace } = useWorkspaceContext()
  const activityKey = activeWorkspace ? `/api/workspaces/${activeWorkspace.id}/activity?page=1&pageSize=5` : null
  const { data, error, isLoading } = useSWR<PaginatedResult<WorkspaceActivityItem>, ApiError>(activityKey, apiFetcher)
  const [open, setOpen] = useState(false)
  const items = data?.items ?? []

  return (
    <div className="relative">
      <Button type="button" variant="ghost" size="icon" aria-label={`Recent activity, ${items.length} recent events`} aria-expanded={open} title="Recent workspace activity" onClick={() => setOpen((current) => !current)} className="relative">
        <Bell aria-hidden="true" />
        {items.length > 0 && <span aria-hidden="true" className="absolute top-1 right-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-secondary px-1 text-[9px] font-bold text-secondary-foreground">{Math.min(items.length, 9)}</span>}
      </Button>
      {open && <section aria-label="Recent workspace activity" className="absolute top-full right-0 z-30 mt-2 w-[min(92vw,340px)] rounded-2xl border border-border bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Recent activity</h2><p className="mt-0.5 text-[11px] text-muted-foreground">Latest workspace events</p></div><Activity aria-hidden="true" className="size-4 text-primary" /></div>
        {isLoading && <p className="py-6 text-center text-xs text-muted-foreground" role="status">Loading activity…</p>}
        {error && <p className="mt-3 rounded-lg bg-error/5 p-2.5 text-xs text-error" role="alert">{error.message}</p>}
        {!isLoading && !error && items.length > 0 && <ol className="mt-3 flex flex-col divide-y divide-border">{items.map((item) => <li key={item.id} className="py-3 first:pt-1 last:pb-1"><p className="text-xs leading-5"><span className="font-medium">{item.actor.name}</span> {activityLabel(item.action)}{item.resourceName ? <> <span className="font-medium">{item.resourceName}</span></> : null}</p><p className="mt-1 text-[10px] text-muted-foreground">{formatRelativeDate(item.createdAt)}</p></li>)}</ol>}
        {!isLoading && !error && !items.length && <p className="py-6 text-center text-xs text-muted-foreground">Workspace activity will appear here.</p>}
        <Link href="/dashboard#activity" onClick={() => setOpen(false)} className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">View activity</Link>
      </section>}
    </div>
  )
}

function HelpButton() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleHelp = () => setOpen(true)
    window.addEventListener('syncspace:help', handleHelp)
    return () => window.removeEventListener('syncspace:help', handleHelp)
  }, [])

  return (
    <>
      <Button type="button" variant="ghost" size="icon" aria-label="Help and keyboard shortcuts" title="Help" onClick={() => setOpen(true)}>
        <HelpCircle aria-hidden="true" />
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Help and shortcuts" description="A few quick ways to move around SyncSpace.">
        <ul className="flex flex-col gap-3 text-sm text-foreground">
          <li className="flex items-center justify-between gap-4"><span>Search accessible documents</span><kbd className="rounded-md border border-border bg-surface-muted px-2 py-1 text-xs">⌘ / Ctrl + K</kbd></li>
          <li>Use the workspace menu to switch spaces or create a new workspace.</li>
          <li>Manage document access from a document&apos;s Share action.</li>
        </ul>
        <div className="mt-5 flex justify-end"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Close</Button></div>
      </Modal>
    </>
  )
}

function UserMenu({ displayName, email }: { displayName: string; email?: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const signOut = async () => {
    try {
      await apiRequest<void>('/auth/logout', { method: 'POST' })
      await mutate(AUTH_USER_KEY, null, { revalidate: false })
      await mutate(WORKSPACES_KEY, null, { revalidate: false })
      router.replace('/login')
      router.refresh()
    } catch (cause) {
      toast(cause instanceof ApiError ? cause.message : 'Unable to sign out right now. Please try again.')
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={`${displayName} account menu`} className="rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50">
        <UserAvatar initials={getInitials(displayName)} name={displayName} tone="slate" size="sm" />
      </button>
      {open && <div className="absolute top-full right-0 z-30 mt-2 w-60 rounded-2xl border border-border bg-white p-2 shadow-xl">
        <div className="border-b border-border px-3 py-2.5"><p className="truncate text-xs font-semibold">{displayName}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{email ?? 'Loading profile'}</p></div>
        <Link href="/settings?section=account" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-surface-muted"><UserRound aria-hidden="true" className="size-4" />Account settings</Link>
        <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-surface-muted"><Settings2 aria-hidden="true" className="size-4" />Workspace settings</Link>
        <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-foreground hover:bg-surface-muted"><LogOut aria-hidden="true" className="size-4" />Sign out</button>
      </div>}
    </div>
  )
}

function activityLabel(action: string): string {
  const labels: Record<string, string> = {
    'document.created': 'created',
    'document.updated': 'updated details for',
    'document.content_updated': 'updated',
    'document.permission_updated': 'changed access to',
    'document.permission_removed': 'removed access to',
    'document.duplicated': 'duplicated',
    'document.archived': 'archived',
    'document.version_created': 'saved a version of',
  }
  return labels[action] ?? action.replace(/^document\./, '').replace(/[._-]/g, ' ')
}
