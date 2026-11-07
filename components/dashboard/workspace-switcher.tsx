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

  const createWorkspace = (created: { id: string; name: string; slug: string }) => {
    setWorkspaces((current) => [...current, created.name])
    setWorkspace(created.name)
    localStorage.setItem('syncspace_workspace', JSON.stringify(created))
    toast(`Workspace “${created.name}” created.`)
  }

  return (
    <div className="relative px-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-3 text-left transition hover:bg-gray-50 hover:border-gray-300 shadow-2xs"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-2xs">
          {workspace.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-gray-950">{workspace}</span>
          <span className="mt-0.5 block text-xs text-gray-500 font-medium">Enterprise Workspace</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-4 left-4 z-20 mt-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">Your workspaces</p>
          <div className="space-y-1">
            {workspaces.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setWorkspace(item)
                  setOpen(false)
                  toast(`Switched to workspace: ${item}`)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  workspace === item
                    ? 'bg-indigo-50 font-bold text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="grid size-7 place-items-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                  {item.slice(0, 1).toUpperCase()}
                </span>
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
          <div className="my-2 border-t border-gray-100" />
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setCreateOpen(true)
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            <Plus aria-hidden="true" className="size-4.5" />
            <span>Create new workspace</span>
          </button>
        </div>
      )}

      <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createWorkspace} />
    </div>
  )
}
