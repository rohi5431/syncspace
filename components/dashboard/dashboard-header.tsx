'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, Check, ChevronRight, Command, Menu, Search, X } from 'lucide-react'
import { useToast } from '@/components/providers/toast-provider'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import type { DocumentItem, ProjectItem } from '@/lib/demo-data'

export function DashboardHeader({ onMenuClick, documents, projects }: { onMenuClick: () => void; documents: DocumentItem[]; projects: ProjectItem[] }) {
  return <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button><SearchCommand documents={documents} projects={projects} /></div><div className="flex items-center gap-2"><NotificationPopover /><button type="button" onClick={() => window.dispatchEvent(new CustomEvent('syncspace:help'))} className="hidden rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 sm:inline-flex" aria-label="Help"><span className="grid size-[18px] place-items-center rounded-full border border-gray-300 text-[11px] font-semibold">?</span></button><div className="ml-1 hidden h-7 w-px bg-gray-200 sm:block" /><button type="button" className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" aria-label="Rohit Kumar, user profile"><UserAvatar initials="RK" name="Rohit Kumar" tone="slate" size="sm" /></button></div></header>
}

function SearchCommand({ documents, projects }: { documents: DocumentItem[]; projects: ProjectItem[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])
  const results = useMemo(() => {
    const entries = [
      ...documents.map((item) => ({ title: item.title, kind: 'Document', href: '/dashboard#documents' })),
      ...projects.map((item) => ({ title: item.title, kind: 'Project', href: '/dashboard#projects' })),
      { title: 'Workspace settings', kind: 'Settings', href: '/settings' },
    ]
    return entries.filter((entry) => `${entry.title} ${entry.kind}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
  }, [documents, projects, query])

  return <div className="relative">
    <Button type="button" variant="outline" onClick={() => setOpen(true)} className="h-9 w-[min(38vw,260px)] justify-start gap-2 rounded-lg border-gray-200 px-3 text-gray-500 shadow-none hover:bg-gray-50 sm:w-[260px]"><Search data-icon="inline-start" /><span className="flex-1 text-left text-xs">Search workspace</span><kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-[9px] text-gray-400 sm:inline-flex">⌘ K</kbd></Button>
    {open && <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/20 p-4 pt-[12vh]" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)} onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}><section role="dialog" aria-modal="true" aria-label="Search workspace" className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"><div className="flex items-center gap-3 border-b border-gray-100 px-4"><Search aria-hidden="true" className="size-4 text-gray-400" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents, projects, and settings…" className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" /><button type="button" onClick={() => setOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100" aria-label="Close search"><X className="size-4" /></button></div><div className="p-2"><p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{query ? 'Results' : 'Quick links'}</p>{results.length ? results.map((result) => <Link key={`${result.kind}-${result.title}`} href={result.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-gray-50"><span className="grid size-8 place-items-center rounded-lg bg-gray-50 text-gray-500"><Command className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-gray-800">{result.title}</span><span className="mt-0.5 block text-[11px] text-gray-400">{result.kind}</span></span><ChevronRight aria-hidden="true" className="size-4 text-gray-300" /></Link>) : <p className="px-3 py-6 text-center text-sm text-gray-500">No matching workspace items.</p>}</div><div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-[10px] text-gray-400"><span>Search across your workspace</span><span>Press Esc to close</span></div></section></div>}
  </div>
}

function NotificationPopover() {
  const [open, setOpen] = useState(false)
  const [read, setRead] = useState(false)
  const toast = useToast()

  return <div className="relative"><button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Notifications" className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"><Bell aria-hidden="true" className="size-[18px]" />{!read && <span className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-white bg-indigo-600" />}</button>{open && <div className="absolute top-full right-0 z-30 mt-2 w-[min(340px,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-1 shadow-lg"><div className="flex items-center justify-between px-3 py-2"><p className="text-sm font-semibold text-gray-900">Notifications</p><button type="button" onClick={() => { setRead(true); toast('All notifications marked as read.') }} className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600"><Check className="size-3" /> Mark all read</button></div><div className="border-t border-gray-100 p-2"><div className="flex gap-3 rounded-lg p-2.5 hover:bg-gray-50"><UserAvatar initials="MC" name="Maya Chen" size="sm" tone="indigo" /><div className="flex-1"><p className="text-xs leading-5 text-gray-700"><span className="font-semibold">Maya Chen</span> mentioned you in <span className="font-medium">Product roadmap</span>.</p><p className="mt-1 text-[10px] text-gray-400">24 minutes ago</p></div>{!read && <span className="mt-1 size-1.5 rounded-full bg-indigo-600" />}</div><div className="flex gap-3 rounded-lg p-2.5 hover:bg-gray-50"><UserAvatar initials="JL" name="Jordan Lee" size="sm" tone="emerald" /><div className="flex-1"><p className="text-xs leading-5 text-gray-700"><span className="font-semibold">Jordan Lee</span> completed a task in <span className="font-medium">Website refresh</span>.</p><p className="mt-1 text-[10px] text-gray-400">1 hour ago</p></div></div></div></div>}</div>
}
