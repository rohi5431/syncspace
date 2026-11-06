'use client'

import { useState } from 'react'
import { useSWRConfig } from 'swr'
import type { WorkspaceSummary } from '@syncspace/contracts'
import { ChevronDown, Plus } from 'lucide-react'
import { useToast } from '@/components/providers/toast-provider'
import { CreateWorkspaceDialog } from '@/components/dashboard/create-dialogs'
import { useWorkspaceContext } from '@/components/dashboard/workspace-provider'
import { apiRequest, WORKSPACES_KEY } from '@/lib/api-client'

export function WorkspaceSwitcher() {
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

  return <div className="relative px-3">
    <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={activeWorkspace ? `Current workspace: ${activeWorkspace.name}` : 'Choose a workspace'} className="flex w-full items-center gap-2.5 rounded-lg border border-gray-200 p-2.5 text-left transition hover:bg-gray-50">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">{(activeWorkspace?.name ?? 'W').slice(0, 1).toUpperCase()}</span>
      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-gray-900">{activeWorkspace?.name ?? (isLoading ? 'Loading workspaces…' : 'No workspace yet')}</span><span className="mt-0.5 block text-[10px] text-gray-500">{activeWorkspace?.role ?? 'Create your first workspace'}</span></span>
      <ChevronDown aria-hidden="true" className={`size-4 text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="absolute top-full right-3 left-3 z-20 mt-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
      <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Your workspaces</p>
      {isLoading && <p className="px-2.5 py-2 text-xs text-gray-500" role="status">Loading workspaces…</p>}
      {error && <p className="px-2.5 py-2 text-xs text-red-600" role="alert">{error.message}</p>}
      {workspaces.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedWorkspaceId(item.id); setOpen(false); toast(`Switched to ${item.name}.`) }} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-gray-50 ${activeWorkspace?.id === item.id ? 'font-semibold text-gray-900' : 'text-gray-600'}`}><span className="grid size-6 place-items-center rounded-md bg-indigo-50 text-[10px] font-semibold text-indigo-700">{item.name.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1 truncate">{item.name}</span><span className="text-[9px] uppercase text-gray-400">{item.role}</span></button>)}
      {!isLoading && !error && !workspaces.length && <p className="px-2.5 py-2 text-xs text-gray-500">Create a workspace to get started.</p>}
      <div className="my-1 border-t border-gray-100" />
      <button type="button" onClick={() => { setOpen(false); setCreateOpen(true) }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"><Plus aria-hidden="true" className="size-4" /> Create workspace</button>
    </div>}
    <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createWorkspace} />
  </div>
}
