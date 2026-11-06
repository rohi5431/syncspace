'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Command, Menu, Search } from 'lucide-react'
import Link from 'next/link'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { getInitials, useAuth } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

export function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth()
  const displayName = user?.name ?? 'User'
  return <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button>
      <SearchCommand />
    </div>
    <div className="flex items-center gap-2">
      <Link href="/dashboard#activity" className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"><Activity aria-hidden="true" className="size-4" /><span className="hidden sm:inline">Activity</span></Link>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('syncspace:help'))} className="hidden rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 sm:inline-flex" aria-label="Help"><span className="grid size-[18px] place-items-center rounded-full border border-gray-300 text-[11px] font-semibold">?</span></button>
      <div className="ml-1 hidden h-7 w-px bg-gray-200 sm:block" />
      <button type="button" className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" aria-label={`${displayName}, user profile`}><UserAvatar initials={getInitials(displayName)} name={displayName} tone="slate" size="sm" /></button>
    </div>
  </header>
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

  return <div>
    <Button type="button" variant="outline" onClick={() => setOpen(true)} className="h-9 w-[min(38vw,260px)] justify-start gap-2 rounded-lg border-gray-200 px-3 text-gray-500 shadow-none hover:bg-gray-50 sm:w-[260px]"><Search data-icon="inline-start" /><span className="flex-1 text-left text-xs">Search documents</span><kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-[9px] text-gray-400 sm:inline-flex"><Command className="size-2.5" /> K</kbd></Button>
    <Modal open={open} onClose={() => setOpen(false)} title="Search documents" description="Find a workspace document by its title." size="md">
      <form onSubmit={(event) => { event.preventDefault(); submitSearch() }}>
        <label htmlFor="workspace-document-search" className="mb-1.5 block text-sm font-medium text-gray-700">Document title</label>
        <div className="flex gap-2">
          <input id="workspace-document-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            if (event.nativeEvent.isComposing || event.keyCode === 229) return
            event.preventDefault()
            submitSearch()
          }} placeholder="Search by title" className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" />
          <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Search</Button>
        </div>
      </form>
    </Modal>
  </div>
}
