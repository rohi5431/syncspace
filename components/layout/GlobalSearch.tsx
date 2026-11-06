'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, Command, FileText, FolderKanban, Search, Settings, Users2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchItem {
  title: string
  kind: 'Document' | 'Project' | 'Task' | 'Team' | 'Settings'
  category: string
  href: string
}

const defaultSearchItems: SearchItem[] = [
  { title: 'Product roadmap — Q4 2026', kind: 'Document', category: 'Product Strategy', href: '/dashboard/documents' },
  { title: 'Launch campaign brief', kind: 'Document', category: 'Marketing', href: '/dashboard/documents' },
  { title: 'Distributed Redis Pub/Sub Spec', kind: 'Document', category: 'Engineering Specs', href: '/dashboard/documents' },
  { title: 'SyncSpace 2.4 Design System Tokens', kind: 'Document', category: 'Design Tokens', href: '/dashboard/documents' },
  { title: 'Website refresh & Design System', kind: 'Project', category: '68% completed', href: '/dashboard/projects' },
  { title: 'Mobile app v2 Beta', kind: 'Project', category: '42% completed', href: '/dashboard/projects' },
  { title: 'Realtime Infrastructure Cluster', kind: 'Project', category: '85% completed', href: '/dashboard/projects' },
  { title: 'Audit Redis pub/sub queue latency', kind: 'Task', category: 'High Priority', href: '/dashboard/tasks' },
  { title: 'Implement collapsible sidebar with rail mode', kind: 'Task', category: 'High Priority', href: '/dashboard/tasks' },
  { title: 'Configure JWT session cookies and proxy rewrite', kind: 'Task', category: 'Medium Priority', href: '/dashboard/tasks' },
  { title: 'Maya Chen', kind: 'Team', category: 'Staff Product Designer', href: '/dashboard/team' },
  { title: 'Jordan Lee', kind: 'Team', category: 'Lead Infrastructure Engineer', href: '/dashboard/team' },
  { title: 'Aisha Shah', kind: 'Team', category: 'Principal Product Manager', href: '/dashboard/team' },
  { title: 'Workspace Settings & Billing', kind: 'Settings', category: 'Preferences', href: '/dashboard/settings' },
  { title: 'Profile & Security', kind: 'Settings', category: 'Account', href: '/dashboard/settings' },
]

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return defaultSearchItems.slice(0, 6)
    return defaultSearchItems
      .filter((item) => `${item.title} ${item.kind} ${item.category}`.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8)
  }, [query])

  const getIcon = (kind: SearchItem['kind']) => {
    switch (kind) {
      case 'Document': return FileText
      case 'Project': return FolderKanban
      case 'Task': return Check
      case 'Team': return Users2
      case 'Settings': return Settings
      default: return Command
    }
  }

  return (
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-10 sm:h-11 w-full justify-between rounded-xl border-[#E9E7F0] bg-gray-50/70 px-3.5 text-gray-500 shadow-2xs hover:bg-[#F7F5FF]/70 hover:border-[#6C4CF1]/40 transition"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search className="size-4 shrink-0 text-gray-400" />
          <span className="truncate text-xs sm:text-sm font-medium">Search documents, projects, tasks...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-bold text-gray-500 shadow-2xs">
          <span>Ctrl</span>
          <span>+</span>
          <span>K</span>
        </kbd>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-gray-950/40 p-4 pt-[10vh] backdrop-blur-xs"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#E9E7F0] bg-white shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 px-5">
              <Search className="size-5 text-[#6C4CF1]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across documents, projects, tasks, team members..."
                className="h-16 w-full bg-transparent text-base outline-none placeholder:text-gray-400 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                aria-label="Close search"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-3">
              <p className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                {query ? 'Search Results' : 'Suggested Resources'}
              </p>
              {results.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {results.map((res) => {
                    const Icon = getIcon(res.kind)
                    return (
                      <Link
                        key={`${res.kind}-${res.title}`}
                        href={res.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3.5 py-2.5 transition hover:bg-[#F7F5FF] group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="grid size-8 place-items-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-[#6C4CF1]/10 group-hover:text-[#6C4CF1] transition">
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900 group-hover:text-[#6C4CF1]">
                              {res.title}
                            </p>
                            <p className="truncate text-xs text-gray-500">{res.category}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 group-hover:bg-[#6C4CF1]/10 group-hover:text-[#6C4CF1]">
                          {res.kind}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">
                  No matching workspace items found.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-3 text-xs text-gray-500">
              <span>Press <kbd className="font-mono font-bold">↵ Enter</kbd> to open</span>
              <span>Press <kbd className="font-mono font-bold">Esc</kbd> to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
