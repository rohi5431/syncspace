'use client'

import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useToast } from '@/components/providers/toast-provider'
import { CreateWorkspaceDialog } from '@/components/dashboard/create-dialogs'

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [workspace, setWorkspace] = useState('Northstar Studio')
  const [workspaces, setWorkspaces] = useState(['Northstar Studio', 'Acme Design Co.'])
  const toast = useToast()

  const createWorkspace = (name: string) => {
    setWorkspaces((current) => [...current, name])
    setWorkspace(name)
    toast(`Workspace “${name}” created in this demo.`)
  }

  return <div className="relative px-3">
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-2.5 rounded-lg border border-gray-200 p-2.5 text-left transition hover:bg-gray-50">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">{workspace.slice(0, 1).toUpperCase()}</span>
      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-gray-900">{workspace}</span><span className="mt-0.5 block text-[10px] text-gray-500">Free workspace</span></span>
      <ChevronDown aria-hidden="true" className={`size-4 text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="absolute top-full right-3 left-3 z-20 mt-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"><p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Your workspaces</p>{workspaces.map((item) => <button key={item} type="button" onClick={() => { setWorkspace(item); setOpen(false); toast(`Switched to ${item}.`) }} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-gray-50 ${workspace === item ? 'font-semibold text-gray-900' : 'text-gray-600'}`}><span className="grid size-6 place-items-center rounded-md bg-indigo-50 text-[10px] font-semibold text-indigo-700">{item.slice(0, 1).toUpperCase()}</span>{item}</button>)}<div className="my-1 border-t border-gray-100" /><button type="button" onClick={() => { setOpen(false); setCreateOpen(true) }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"><Plus aria-hidden="true" className="size-4" /> Create workspace</button></div>}
    <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createWorkspace} />
  </div>
}
