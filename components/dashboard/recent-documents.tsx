'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Eye,
  FileEdit,
  FileText,
  Globe,
  Lock,
  MoreVertical,
  Plus,
  Share2,
  Star,
  Trash2,
  Users,
} from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import type { DocumentSummary } from './dashboard-types'

export function RecentDocuments({
  documents,
  onOpenDocument,
  onShareDocument,
  onRenameDocument,
  onToggleStar,
  onCreateDocument,
}: {
  documents: DocumentSummary[]
  onOpenDocument: (doc: DocumentSummary) => void
  onShareDocument: (doc: DocumentSummary) => void
  onRenameDocument: (doc: DocumentSummary) => void
  onToggleStar: (docId: string) => void
  onCreateDocument: () => void
}) {
  const [activeTab, setActiveTab] = useState<'all' | 'starred' | 'shared'>('all')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const filteredDocs = documents.filter((doc) => {
    if (activeTab === 'starred') return doc.starred
    if (activeTab === 'shared') return doc.collaborators > 1
    return true
  })

  return (
    <section id="recent-documents" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs scroll-mt-24">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937]">Recent Documents</h2>
            <span className="rounded-full bg-[#6C4CF1]/10 px-2.5 py-0.5 text-xs font-bold text-[#6C4CF1]">
              {documents.length} Total
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
            Pick up where your team left off with instant WebSocket real-time sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100/80 p-1 text-xs font-bold text-gray-600">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeTab === 'all' ? 'bg-white text-[#6C4CF1] shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              All Docs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('starred')}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeTab === 'starred' ? 'bg-white text-[#6C4CF1] shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              Starred
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shared')}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeTab === 'shared' ? 'bg-white text-[#6C4CF1] shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              Shared
            </button>
          </div>

          <Button
            type="button"
            onClick={onCreateDocument}
            className="h-9 sm:h-10 rounded-xl bg-[#6C4CF1] px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-[#5738D6]"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Document</span>
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredDocs.map((doc) => (
          <article
            key={doc.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-[#F7F5FF]/40 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#6C4CF1]/40 hover:bg-white hover:shadow-md"
          >
            {/* Top row: Icon, Category & Actions */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-white text-[#6C4CF1] shadow-2xs border border-gray-100 transition group-hover:bg-[#6C4CF1] group-hover:text-white">
                  <FileText className="size-5" />
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleStar(doc.id)
                    }}
                    title={doc.starred ? 'Starred' : 'Star document'}
                    className={`rounded-lg p-1.5 transition ${
                      doc.starred ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'
                    }`}
                  >
                    <Star className={`size-4.5 ${doc.starred ? 'fill-amber-400' : ''}`} />
                  </button>

                  {/* Options Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpenId(menuOpenId === doc.id ? null : doc.id)
                      }}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                      aria-label="Document options"
                    >
                      <MoreVertical className="size-4.5" />
                    </button>

                    {menuOpenId === doc.id && (
                      <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl z-20 animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null)
                            onOpenDocument(doc)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
                        >
                          <Eye className="size-3.5 text-[#6C4CF1]" />
                          <span>Open Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null)
                            onRenameDocument(doc)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
                        >
                          <FileEdit className="size-3.5 text-gray-500" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null)
                            onShareDocument(doc)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
                        >
                          <Share2 className="size-3.5 text-gray-500" />
                          <span>Share Access</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <button
                type="button"
                onClick={() => onOpenDocument(doc)}
                className="mt-4 text-left w-full block"
              >
                <h3 className="text-base font-bold text-[#1F2937] transition group-hover:text-[#6C4CF1] line-clamp-1">
                  {doc.title}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                    {doc.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6C4CF1]">
                    <Users className="size-3" />
                    <span>{doc.collaborators} collaborators</span>
                  </span>
                </div>
              </button>
            </div>

            {/* Bottom: Owner, Timestamp, Access Badge */}
            <div className="mt-5 flex items-center justify-between border-t border-gray-100/80 pt-3 text-xs">
              <div className="flex items-center gap-2">
                <UserAvatar initials={doc.initials} name={doc.authorName} size="sm" tone={doc.tone} />
                <span className="truncate font-semibold text-gray-600">{doc.authorName}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    doc.accessLevel === 'Public View'
                      ? 'bg-blue-50 text-blue-700'
                      : doc.accessLevel === 'Restricted'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-purple-50 text-purple-700'
                  }`}
                >
                  {doc.accessLevel}
                </span>
                <span className="text-gray-400 font-medium">{doc.updatedAt}</span>
              </div>
            </div>
          </article>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-12 text-center bg-gray-50/50">
            <FileText className="mx-auto size-10 text-gray-300" />
            <p className="mt-3 text-base font-bold text-gray-800">No documents in this view</p>
            <p className="mt-1 text-xs text-gray-500">
              {activeTab === 'starred' ? 'Star important documents to access them quickly.' : 'Create your first collaborative document.'}
            </p>
            <Button
              type="button"
              onClick={onCreateDocument}
              className="mt-4 rounded-xl bg-[#6C4CF1] px-5 text-white hover:bg-[#5738D6]"
            >
              Create Document
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
