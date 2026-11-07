'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FileEdit,
  FilePlus,
  FileText,
  Filter,
  FolderPlus,
  Grid,
  List,
  MoreVertical,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { useToast } from '@/components/providers/toast-provider'
import { apiFetch } from '@/lib/api-client'
import {
  CreateDocumentDialog,
  RenameDocumentDialog,
  ShareDocumentDialog,
} from '@/components/dashboard/create-dialogs'
import type { DocumentSummary } from '@/components/dashboard/dashboard-types'
import { DocumentWorkspaceEditor } from './document-workspace-editor'

export function DocumentsManager() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [updatingStars, setUpdatingStars] = useState<Set<string>>(() => new Set())
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('All')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedOwner, setSelectedOwner] = useState('All')
  const [activeTab, setActiveTab] = useState<'all' | 'starred' | 'shared'>('all')
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [shareDoc, setShareDoc] = useState<DocumentSummary | null>(null)
  const [renameDoc, setRenameDoc] = useState<DocumentSummary | null>(null)
  const [activeEditorDoc, setActiveEditorDoc] = useState<DocumentSummary | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const toast = useToast()

  useEffect(() => {
    let active = true
    apiFetch('/api/dashboard/summary')
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text() || 'Unable to load workspace')
        return response.json()
      })
      .then(async (summary: { workspace?: { id?: string } }) => {
        const id = summary.workspace?.id
        if (!id) throw new Error('No workspace is available')
        if (!active) return
        setWorkspaceId(id)
        const response = await apiFetch(`/api/documents/folders?workspaceId=${encodeURIComponent(id)}`)
        if (!response.ok) throw new Error(await response.text() || 'Unable to load folders')
        const loadedFolders: Array<{ id: string; name: string }> = await response.json()
        if (active) setFolders(loadedFolders)
      })
      .catch((error: unknown) => {
        if (active) toast(error instanceof Error ? error.message : 'Unable to load folders')
      })
    return () => { active = false }
  }, [toast])

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      try {
        const query = searchQuery.trim()
        if (!workspaceId) return
        const params = new URLSearchParams({ workspaceId })
        if (query) params.set('q', query)
        const response = await apiFetch(`/api/documents?${params}`)
        if (!response.ok) throw new Error(await response.text() || 'Unable to load documents')
        const items: Array<Record<string, unknown>> = await response.json()
        if (!active) return
        setDocuments(items.map((item) => {
          const permissions = Array.isArray(item.permissions) ? item.permissions : []
          const updatedAt = String(item.updatedAt ?? '')
          const tone = ['indigo', 'emerald', 'amber', 'slate', 'pink'].includes(String(item.tone))
            ? String(item.tone) as DocumentSummary['tone']
            : 'indigo'
          return {
            id: String(item.id),
            title: String(item.title),
            category: String(item.category ?? 'Technical Documentation'),
            authorName: String(item.authorName ?? 'Unknown user'),
            initials: String(item.initials ?? 'U'),
            tone,
            updatedAt,
            collaborators: permissions.length + 1,
            accessLevel: permissions.length ? 'Restricted' : 'Workspace Edit',
            starred: Boolean(item.starred),
            type: String(item.type ?? 'TECHNICAL_DOCUMENTATION'),
            editor: String(item.editor ?? 'rich-text'),
            content: String(item.content ?? ''),
            folderId: typeof item.folderId === 'string' ? item.folderId : null,
          }
        }))
        setLoadError('')
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load documents')
      } finally {
        if (active) setLoading(false)
      }
    }, searchQuery ? 250 : 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [searchQuery, workspaceId])

  // Filter & Search logic
  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (activeTab === 'starred' && !doc.starred) return false
      if (activeTab === 'shared' && doc.collaborators <= 1) return false
      if (selectedFolder === 'root' && doc.folderId) return false
      if (selectedFolder !== 'All' && selectedFolder !== 'root' && doc.folderId !== selectedFolder) return false
      if (selectedCategory !== 'All' && doc.category !== selectedCategory) return false
      if (selectedOwner !== 'All' && doc.authorName !== selectedOwner) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return doc.title.toLowerCase().includes(q)
          || doc.category.toLowerCase().includes(q)
          || (doc.content ?? '').toLowerCase().includes(q)
      }
      return true
    }).sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    })
  }, [documents, activeTab, selectedCategory, selectedOwner, selectedFolder, searchQuery, sortBy])

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleStar = async (id: string) => {
    const document = documents.find((item) => item.id === id)
    if (!document || updatingStars.has(id)) return
    const starred = !document.starred
    setUpdatingStars((previous) => new Set(previous).add(id))
    setDocuments((previous) => previous.map((item) => item.id === id ? { ...item, starred } : item))
    try {
      const response = await apiFetch(`/api/documents/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred }),
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to update document')
    } catch (error) {
      setDocuments((previous) => previous.map((item) => item.id === id ? { ...item, starred: document.starred } : item))
      toast(error instanceof Error ? error.message : 'Unable to update document')
    } finally {
      setUpdatingStars((previous) => {
        const next = new Set(previous)
        next.delete(id)
        return next
      })
    }
  }

  const handleDelete = async (id: string, title: string) => {
    try {
      const response = await apiFetch(`/api/documents/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await response.text() || 'Unable to delete document')
      setDocuments((prev) => prev.filter((document) => document.id !== id))
      toast(`“${title}” was deleted.`)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to delete document')
    }
  }

  const handleDuplicate = async (doc: DocumentSummary) => {
    try {
      const response = await apiFetch(`/api/documents/${encodeURIComponent(doc.id)}/duplicate`, { method: 'POST' })
      if (!response.ok) throw new Error(await response.text() || 'Unable to duplicate document')
      const duplicate = await response.json()
      setDocuments((prev) => [{
        ...doc,
        id: duplicate.id,
        title: duplicate.title,
        updatedAt: duplicate.updatedAt,
        content: duplicate.content,
      }, ...prev])
      toast(`Duplicated “${doc.title}”.`)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to duplicate document')
    }
  }

  const createFolder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!workspaceId || !newFolderName.trim()) return
    try {
      const response = await apiFetch('/api/documents/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, name: newFolderName.trim() }),
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to create folder')
      const folder = await response.json()
      setFolders((previous) => [...previous, { id: folder.id, name: folder.name }])
      setSelectedFolder(folder.id)
      setNewFolderName('')
      setShowNewFolder(false)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to create folder')
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#E9E7F0] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            My Documents
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#6B7280]">
            Create, collaborate, and manage all documents across your workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowNewFolder((visible) => !visible)}
            className="h-11 rounded-xl border-[#E9E7F0] bg-white px-4 text-sm font-semibold text-gray-700 shadow-2xs hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
          >
            <FolderPlus className="size-4.5 text-gray-500" />
            <span>New Folder</span>
          </Button>

          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-11 rounded-xl bg-[#6C4CF1] px-5 text-sm font-bold text-white shadow-md shadow-[#6C4CF1]/20 hover:bg-[#5738D6]"
          >
            <Plus className="size-5" />
            <span>Create Document</span>
          </Button>
        </div>
        {showNewFolder && (
          <form onSubmit={createFolder} className="flex gap-2 rounded-xl border border-[#E9E7F0] bg-white p-3">
            <input
              autoFocus
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              placeholder="Folder name"
              className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm"
            />
            <Button type="submit" disabled={!workspaceId} className="rounded-lg bg-[#6C4CF1] text-white">Create</Button>
            <Button type="button" variant="outline" onClick={() => setShowNewFolder(false)} className="rounded-lg">Cancel</Button>
          </form>
        )}
      </div>

      {/* 2. CONTROLS BAR: SEARCH, FILTERS, VIEW TOGGLE */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-[#E9E7F0] bg-white p-4 shadow-xs">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 size-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search documents by title or category..."
            className="h-11 w-full rounded-xl border border-[#E9E7F0] pl-10 pr-3.5 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        {/* Right: Filter dropdowns & View Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100/80 p-1 text-xs font-bold text-gray-600">
            {(['all', 'starred', 'shared'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab)
                  setCurrentPage(1)
                }}
                className={`rounded-lg px-3 py-1.5 capitalize transition ${
                  activeTab === tab
                    ? 'bg-white text-[#6C4CF1] shadow-2xs font-extrabold'
                    : 'hover:text-gray-900'
                }`}
              >
                {tab === 'all' ? 'All Docs' : tab}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setCurrentPage(1)
            }}
            className="h-10 rounded-xl border border-[#E9E7F0] bg-white px-3 text-xs font-semibold text-gray-700 outline-none hover:border-[#6C4CF1]"
          >
            <option value="All">All Categories</option>
            <option value="Product Strategy">Product Strategy</option>
            <option value="Engineering Specs">Engineering Specs</option>
            <option value="Marketing">Marketing</option>
            <option value="Design Tokens & System">Design System</option>
            <option value="Meeting Notes">Meeting Notes</option>
          </select>

          <select
            value={selectedFolder}
            onChange={(event) => {
              setSelectedFolder(event.target.value)
              setCurrentPage(1)
            }}
            className="h-10 rounded-xl border border-[#E9E7F0] bg-white px-3 text-xs font-semibold text-gray-700 outline-none hover:border-[#6C4CF1]"
            aria-label="Filter by folder"
          >
            <option value="All">All Folders</option>
            <option value="root">Unfiled</option>
            {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 rounded-xl border border-[#E9E7F0] bg-white px-3 text-xs font-semibold text-gray-700 outline-none hover:border-[#6C4CF1]"
          >
            <option value="updated">Last Modified</option>
            <option value="title">Title (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-[#E9E7F0] bg-gray-50/70 p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid' ? 'bg-white text-[#6C4CF1] shadow-2xs' : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <Grid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'list' ? 'bg-white text-[#6C4CF1] shadow-2xs' : 'text-gray-400 hover:text-gray-700'
              }`}
              title="List View"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. DOCUMENTS CONTENT WITH STABLE MIN-HEIGHT TO PREVENT LAYOUT JUMPING */}
      <div className="flex-1 flex flex-col justify-between min-h-[580px]">
        {viewMode === 'grid' ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 content-start">
            {paginated.map((doc) => (
              <article
                key={doc.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#E9E7F0] bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#6C4CF1]/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-12 place-items-center rounded-xl border border-indigo-100 bg-[#F7F5FF] text-[#6C4CF1] shadow-2xs transition group-hover:bg-[#6C4CF1] group-hover:text-white">
                      <FileText className="size-6" />
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleStar(doc.id)}
                        disabled={updatingStars.has(doc.id)}
                        aria-pressed={doc.starred}
                        className={`rounded-lg p-1.5 transition ${
                          doc.starred ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'
                        }`}
                        title={doc.starred ? 'Starred' : 'Star document'}
                      >
                        <Star className={`size-5 ${doc.starred ? 'fill-amber-400' : ''}`} />
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <MoreVertical className="size-5" />
                        </button>

                        {menuOpenId === doc.id && (
                          <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null)
                                setActiveEditorDoc(doc)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
                            >
                              <Eye className="size-4 text-[#6C4CF1]" />
                              <span>Open in Editor</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null)
                                setRenameDoc(doc)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
                            >
                              <FileEdit className="size-4 text-gray-500" />
                              <span>Rename</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null)
                                setShareDoc(doc)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
                            >
                              <Share2 className="size-4 text-gray-500" />
                              <span>Share</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null)
                                handleDuplicate(doc)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
                            >
                              <Copy className="size-4 text-gray-500" />
                              <span>Duplicate</span>
                            </button>
                            <div className="my-1 border-t border-gray-100" />
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null)
                                handleDelete(doc.id, doc.title)
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="size-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <button
                    type="button"
                    onClick={() => setActiveEditorDoc(doc)}
                    className="mt-4 text-left w-full block"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-[#1F2937] transition group-hover:text-[#6C4CF1] line-clamp-1">
                      {doc.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                        {doc.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C4CF1]">
                        <Users className="size-3.5" />
                        <span>{doc.collaborators} peers</span>
                      </span>
                    </div>
                  </button>
                </div>

                {/* Bottom footer */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-3.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <UserAvatar initials={doc.initials} name={doc.authorName} size="sm" tone={doc.tone} />
                    <span className="truncate font-semibold text-gray-600">{doc.authorName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-[#6C4CF1]">
                      {doc.accessLevel}
                    </span>
                    <span className="text-gray-400 font-medium">{doc.updatedAt}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="overflow-hidden rounded-2xl border border-[#E9E7F0] bg-white shadow-xs">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-[#E9E7F0] bg-[#F7F5FF]/60 text-xs font-extrabold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3.5 px-4">Document</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Category</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Author</th>
                  <th className="py-3.5 px-4">Last Modified</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Access</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F7F5FF]/50 transition group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleStar(doc.id)}
                          disabled={updatingStars.has(doc.id)}
                          aria-pressed={doc.starred}
                          className={`transition ${doc.starred ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
                        >
                          <Star className={`size-4.5 ${doc.starred ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveEditorDoc(doc)}
                          className="font-bold text-[#1F2937] hover:text-[#6C4CF1] truncate text-sm sm:text-base text-left"
                        >
                          {doc.title}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-xs font-semibold text-gray-500">
                      {doc.category}
                    </td>
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <UserAvatar initials={doc.initials} name={doc.authorName} size="sm" tone={doc.tone} />
                        <span className="text-xs font-semibold text-gray-700">{doc.authorName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-500">
                      {Number.isNaN(Date.parse(doc.updatedAt)) ? doc.updatedAt : new Date(doc.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-[#6C4CF1]">
                        {doc.accessLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveEditorDoc(doc)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
                          title="Open document"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShareDoc(doc)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
                          title="Share document"
                        >
                          <Share2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete document"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {loading && <p className="py-12 text-center text-sm text-gray-500">Loading documents…</p>}
        {!loading && loadError && <p role="alert" className="py-4 text-center text-sm text-red-600">{loadError}</p>}
        {!loading && !loadError && filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">No matching documents found.</p>
        )}

        {/* 4. PAGINATION - ANCHORED STABLY */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E9E7F0] pt-5 mt-6">
            <p className="text-xs sm:text-sm font-semibold text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} documents
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="h-9 px-3 rounded-xl border-[#E9E7F0] text-xs font-bold"
              >
                <ChevronLeft className="size-4" />
                <span>Previous</span>
              </Button>
              <span className="px-3 text-xs font-bold text-[#6C4CF1]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="h-9 px-3 rounded-xl border-[#E9E7F0] text-xs font-bold"
              >
                <span>Next</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 5. FULL COLLABORATIVE EDITOR MODAL */}
      {activeEditorDoc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-xs"
        >
          <div className="flex h-[88vh] w-full max-w-5xl flex-col rounded-3xl border border-[#E9E7F0] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-[#6C4CF1] text-white">
                  <FileText className="size-5" />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#1F2937]">
                    {activeEditorDoc.title}
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    {activeEditorDoc.category} · Real-time synchronized
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShareDoc(activeEditorDoc)}
                  className="h-9 rounded-xl border-gray-200 text-xs font-bold"
                >
                  <Share2 className="size-3.5" />
                  <span>Share</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveEditorDoc(null)}
                  className="h-9 rounded-xl bg-gray-900 px-4 text-xs font-bold text-white hover:bg-gray-800"
                >
                  Done
                </Button>
              </div>
            </div>

            <DocumentWorkspaceEditor document={activeEditorDoc} />
          </div>
        </div>
      )}

      {/* DIALOGS */}
      <CreateDocumentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        workspaceId={workspaceId || undefined}
        folderId={selectedFolder !== 'All' && selectedFolder !== 'root' ? selectedFolder : undefined}
        onCreate={(doc) => {
          setDocuments((prev) => [doc, ...prev])
          toast(`“${doc.title}” created.`)
        }}
      />

      {shareDoc && (
        <ShareDocumentDialog
          open={Boolean(shareDoc)}
          onClose={() => setShareDoc(null)}
          documentId={shareDoc.id}
          documentTitle={shareDoc.title}
        />
      )}

      {renameDoc && (
        <RenameDocumentDialog
          open={Boolean(renameDoc)}
          onClose={() => setRenameDoc(null)}
          currentTitle={renameDoc.title}
          onRename={(newTitle) => {
            void apiFetch(`/api/documents/${encodeURIComponent(renameDoc.id)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: newTitle }),
            }).then(async (response) => {
              if (!response.ok) throw new Error(await response.text() || 'Unable to rename document')
              setDocuments((prev) => prev.map((document) =>
                document.id === renameDoc.id ? { ...document, title: newTitle } : document,
              ))
              toast(`Renamed document to “${newTitle}”.`)
            }).catch((error: unknown) => {
              toast(error instanceof Error ? error.message : 'Unable to rename document')
            })
          }}
        />
      )}
    </div>
  )
}
