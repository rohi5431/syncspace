'use client'

import { useState } from 'react'
import { useSWRConfig } from 'swr'
import type { WorkspaceSummary } from '@syncspace/contracts'
import { ChevronDown, Plus } from 'lucide-react'
import { useToast } from '@/components/providers/toast-provider'
import { CreateWorkspaceDialog } from '@/components/dashboard/create-dialogs'
import { useWorkspaceContext } from '@/components/dashboard/workspace-provider'
import { apiRequest, WORKSPACES_KEY } from '@/lib/api-client'

export function WorkspaceSwitcher({ collapsed = false, variant = 'sidebar' }: { collapsed?: boolean; variant?: 'sidebar' | 'header' }) {
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const { workspaces, activeWorkspace, setSelectedWorkspaceId, isLoading, error } = useWorkspaceContext()
  const { mutate } = useSWRConfig()
  const toast = useToast()

  const createWorkspace = async (name: string, description: string) => {
    const created = await apiRequest<WorkspaceSummary>('/workspaces', {
      method: 'POST',
      body: { name, description: description || undefined },
    })
    await mutate<WorkspaceSummary[]>(WORKSPACES_KEY, (current) => [created, ...(current ?? []).filter((workspace) => workspace.id !== created.id)], { revalidate: false })
    setSelectedWorkspaceId(created.id)
    toast(`Workspace “${created.name}” created.`)
  }

  return <div className={`relative ${variant === 'header' ? 'w-12' : collapsed ? 'px-2' : 'px-3'}`}>
    <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={activeWorkspace ? `Current workspace: ${activeWorkspace.name}` : 'Choose a workspace'} title={collapsed ? activeWorkspace?.name ?? 'Choose a workspace' : undefined} className={`flex w-full items-center rounded-xl border border-border bg-surface-muted text-left transition hover:bg-accent ${variant === 'header' ? 'h-11 justify-center p-1.5' : `p-2.5 ${collapsed ? 'justify-center' : 'gap-2.5'}`}`}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">{(activeWorkspace?.name ?? 'W').slice(0, 1).toUpperCase()}</span>
      {!collapsed && <>
        <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-foreground">{activeWorkspace?.name ?? (isLoading ? 'Loading workspaces…' : 'No workspace yet')}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{activeWorkspace?.role ?? 'Create your first workspace'}</span></span>
        <ChevronDown aria-hidden="true" className={`size-4 text-muted-foreground transition ${open ? 'rotate-180' : ''}`} />
      </>}
    </button>
    {open && <div className={`absolute z-30 rounded-xl border border-border bg-white p-1.5 shadow-lg ${collapsed ? 'top-0 left-full ml-2 w-64' : 'top-full right-3 left-3 mt-2'}`}>
      <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your workspaces</p>
      {isLoading && <p className="px-2.5 py-2 text-xs text-muted-foreground" role="status">Loading workspaces…</p>}
      {error && <p className="px-2.5 py-2 text-xs text-error" role="alert">{error.message}</p>}
      {workspaces.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedWorkspaceId(item.id); setOpen(false); toast(`Switched to ${item.name}.`) }} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-surface-muted ${activeWorkspace?.id === item.id ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}><span className="grid size-6 place-items-center rounded-md bg-accent text-[10px] font-semibold text-primary">{item.name.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1 truncate">{item.name}</span><span className="text-[9px] uppercase text-muted-foreground">{item.role}</span></button>)}
      {!isLoading && !error && !workspaces.length && <p className="px-2.5 py-2 text-xs text-muted-foreground">Create a workspace to get started.</p>}
      <div className="my-1 border-t border-border" />
      <button type="button" onClick={() => { setOpen(false); setCreateOpen(true) }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition hover:bg-surface-muted"><Plus aria-hidden="true" className="size-4" /> Create workspace</button>
    </div>}
    <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createWorkspace} />
  </div>
}
