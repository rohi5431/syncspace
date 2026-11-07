'use client'

import { useState } from 'react'
import { Check, ChevronDown, Plus, Sparkles } from 'lucide-react'
import { useToast } from '@/components/providers/toast-provider'
import { CreateWorkspaceDialog } from '@/components/dashboard/create-dialogs'

export function WorkspaceSwitcher({
  currentWorkspace = 'Northstar Studio',
  onWorkspaceChange,
}: {
  currentWorkspace?: string
  onWorkspaceChange?: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [workspace, setWorkspace] = useState(currentWorkspace)
  const [workspaces, setWorkspaces] = useState(['Northstar Studio', 'Acme Design Co.', 'Apollo Engineering'])
  const toast = useToast()

  const handleSelect = (name: string) => {
    setWorkspace(name)
    setOpen(false)
    onWorkspaceChange?.(name)
    toast(`Switched active workspace to: ${name}`)
  }

  const handleCreate = (created: { id: string; name: string; slug: string }) => {
    setWorkspaces((prev) => [...prev, created.name])
    setWorkspace(created.name)
    onWorkspaceChange?.(created.name)
    localStorage.setItem('syncspace_workspace', JSON.stringify(created))
    toast(`Workspace “${created.name}” created and activated.`)
  }

  return (
    <div className="relative px-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border border-[#E9E7F0] bg-white p-2.5 text-left transition hover:border-[#6C4CF1]/40 hover:bg-[#F7F5FF]/50 shadow-2xs"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#6C4CF1] text-sm font-extrabold text-white shadow-xs">
          {workspace.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold text-[#1F2937]">{workspace}</span>
          <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-[#6C4CF1]">
            <Sparkles className="size-3" />
            <span>Pro Workspace</span>
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-3 left-3 z-50 mt-1.5 rounded-2xl border border-[#E9E7F0] bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
          <p className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Workspaces
          </p>
          <div className="space-y-1">
            {workspaces.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSelect(item)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold transition ${
                  workspace === item
                    ? 'bg-[#6C4CF1]/10 text-[#6C4CF1]'
                    : 'text-gray-700 hover:bg-[#F7F5FF]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid size-6 place-items-center rounded-md bg-[#6C4CF1]/15 text-xs font-bold text-[#6C4CF1]">
                    {item.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="truncate">{item}</span>
                </div>
                {workspace === item && <Check className="size-4 shrink-0 text-[#6C4CF1]" />}
              </button>
            ))}
          </div>

          <div className="my-1.5 border-t border-gray-100" />

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setCreateOpen(true)
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#6C4CF1] hover:bg-[#F7F5FF] transition"
          >
            <Plus className="size-4" />
            <span>Create new workspace</span>
          </button>
        </div>
      )}

      <CreateWorkspaceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
