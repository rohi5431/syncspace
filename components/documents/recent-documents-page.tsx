'use client'

import { useMemo, useState } from 'react'
import {
  Clock,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  History,
  MoreVertical,
  Search,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { useToast } from '@/components/providers/toast-provider'
import { PreviewDialog, ShareDocumentDialog } from '@/components/dashboard/create-dialogs'
import type { DocumentSummary } from '@/components/dashboard/dashboard-types'

interface RecentDocItem extends DocumentSummary {
  lastOpened: string
  accessType: 'opened' | 'edited' | 'shared'
}

const initialRecentDocs: RecentDocItem[] = [
  {
    id: 'rd-1',
    title: 'Product roadmap — Q4 2026',
    category: 'Product Strategy',
    authorName: 'Maya Chen',
    initials: 'MC',
    tone: 'indigo',
    updatedAt: '24m ago',
    lastOpened: '10 minutes ago',
    collaborators: 4,
    accessLevel: 'Workspace Edit',
    starred: true,
    accessType: 'edited',
  },
  {
    id: 'rd-2',
    title: 'Launch campaign brief',
    category: 'Marketing',
    authorName: 'Rohit Kumar',
    initials: 'RK',
    tone: 'emerald',
    updatedAt: '2 hours ago',
    lastOpened: '1 hour ago',
    collaborators: 3,
    accessLevel: 'Public View',
    starred: false,
    accessType: 'opened',
  },
  {
    id: 'rd-3',
    title: 'Distributed Redis Pub/Sub Spec',
    category: 'Engineering Specs',
    authorName: 'Jordan Lee',
    initials: 'JL',
    tone: 'amber',
    updatedAt: 'Yesterday',
    lastOpened: '3 hours ago',
    collaborators: 5,
    accessLevel: 'Workspace Edit',
    starred: true,
    accessType: 'edited',
  },
  {
    id: 'rd-4',
    title: 'SyncSpace 2.4 Design System Tokens',
    category: 'Design Tokens',
    authorName: 'Aisha Shah',
    initials: 'AS',
    tone: 'pink',
    updatedAt: '2 days ago',
    lastOpened: 'Yesterday',
    collaborators: 2,
    accessLevel: 'Workspace Edit',
    starred: false,
    accessType: 'shared',
  },
  {
    id: 'rd-5',
    title: 'SOC 2 Type II Compliance Checklist',
    category: 'Engineering Specs',
    authorName: 'Jordan Lee',
    initials: 'JL',
    tone: 'slate',
    updatedAt: '5 days ago',
    lastOpened: '2 days ago',
    collaborators: 4,
    accessLevel: 'Restricted',
    starred: false,
    accessType: 'opened',
  },
]

export function RecentDocumentsView() {
  const [items, setItems] = useState<RecentDocItem[]>(initialRecentDocs)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'opened' | 'edited' | 'shared'>('all')
  const [previewDoc, setPreviewDoc] = useState<RecentDocItem | null>(null)
  const [shareDoc, setShareDoc] = useState<RecentDocItem | null>(null)
  const toast = useToast()

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.accessType !== typeFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      }
      return true
    })
  }, [items, typeFilter, search])

  const toggleStar = (id: string) => {
    setItems((prev) =>
      prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d)),
    )
  }

  const removeRecent = (id: string, title: string) => {
    setItems((prev) => prev.filter((d) => d.id !== id))
    toast(`Removed “${title}” from recent history.`)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#E9E7F0] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
              Recent Documents
            </h1>
            <span className="rounded-full bg-[#6C4CF1]/10 px-2.5 py-0.5 text-xs font-bold text-[#6C4CF1]">
              Live History
            </span>
          </div>
          <p className="mt-1 text-sm sm:text-base text-[#6B7280]">
            Quickly jump back into documents you have opened, edited, or had shared with you.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setItems([])
            toast('Recent history cleared.')
          }}
          className="h-10 rounded-xl border-gray-200 text-xs font-bold text-gray-600 hover:text-red-600 hover:bg-red-50"
        >
          <History className="size-4" />
          <span>Clear History</span>
        </Button>
      </div>

      {/* 2. Controls: Filter tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E9E7F0] bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 size-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recent history..."
            className="h-10 w-full rounded-xl border border-[#E9E7F0] pl-10 pr-3.5 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        <div className="flex rounded-xl bg-gray-100/80 p-1 text-xs font-bold text-gray-600">
          {(['all', 'opened', 'edited', 'shared'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTypeFilter(tab)}
              className={`rounded-lg px-3 py-1.5 capitalize transition ${
                typeFilter === tab ? 'bg-white text-[#6C4CF1] shadow-2xs font-extrabold' : 'hover:text-gray-900'
              }`}
            >
              {tab === 'all' ? 'All Activity' : `Recently ${tab}`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Recent Documents List with stable min-height */}
      <div className="divide-y divide-gray-100 rounded-2xl border border-[#E9E7F0] bg-white p-2 shadow-xs min-h-[460px]">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center rounded-xl hover:bg-[#F7F5FF]/60 transition cursor-pointer"
            onClick={() => setPreviewDoc(item)}
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-indigo-100 bg-[#F7F5FF] text-[#6C4CF1] shadow-2xs group-hover:bg-[#6C4CF1] group-hover:text-white transition">
                <FileText className="size-5.5" />
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#1F2937] group-hover:text-[#6C4CF1] truncate text-base">
                    {item.title}
                  </h3>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      item.accessType === 'edited'
                        ? 'bg-purple-50 text-purple-700'
                        : item.accessType === 'shared'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.accessType.toUpperCase()}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#6B7280]">
                  <span>{item.category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>Opened {item.lastOpened}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:justify-end" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <UserAvatar initials={item.initials} name={item.authorName} size="sm" tone={item.tone} />
                <span className="text-xs font-semibold text-gray-600 hidden md:inline">{item.authorName}</span>
              </div>

              <button
                type="button"
                onClick={() => toggleStar(item.id)}
                className={`p-1.5 transition ${item.starred ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
                title="Star"
              >
                <Star className={`size-4.5 ${item.starred ? 'fill-amber-400' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setShareDoc(item)}
                className="p-1.5 text-gray-400 hover:text-[#6C4CF1] transition"
                title="Share"
              >
                <Share2 className="size-4.5" />
              </button>

              <button
                type="button"
                onClick={() => removeRecent(item.id, item.title)}
                className="p-1.5 text-gray-400 hover:text-red-600 transition"
                title="Remove from history"
              >
                <X className="size-4.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            <History className="mx-auto size-10 text-gray-300" />
            <p className="mt-3 font-bold text-gray-700">No documents found in recent activity</p>
            <p className="text-xs text-gray-400">Open or edit documents to build your recent collaboration stream.</p>
          </div>
        )}
      </div>

      {previewDoc && (
        <PreviewDialog
          open={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
          description={`${previewDoc.category} · Last accessed ${previewDoc.lastOpened} · ${previewDoc.collaborators} collaborators`}
        />
      )}

      {shareDoc && (
        <ShareDocumentDialog
          open={Boolean(shareDoc)}
          onClose={() => setShareDoc(null)}
          documentId={shareDoc.id}
          documentTitle={shareDoc.title}
        />
      )}
    </div>
  )
}
