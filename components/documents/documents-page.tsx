'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import type { DocumentSummary, FolderSummary, PaginatedResult } from '@syncspace/contracts'
import { ArrowDown, ArrowUp, FileText, Grid2X2, List, Plus, Search } from 'lucide-react'
import { FolderSidebar } from '@/components/documents/folder-sidebar'
import { DocumentAction, DocumentCard, DocumentRow } from '@/components/documents/document-card'
import { ConfirmActionDialog, DocumentFormDialog, FolderFormDialog, MoveDocumentDialog } from '@/components/documents/document-dialogs'
import { DocumentShareDialog } from '@/components/documents/document-share-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import { useWorkspaceContext } from '@/components/dashboard/workspace-provider'
import { ApiError, apiFetcher, apiRequest, useAuth } from '@/lib/api-client'
import { refreshWorkspaceData } from '@/lib/workspace-data'

export function DocumentsPage({ initialSearch = '' }: { initialSearch?: string }) {
  const { activeWorkspace, isLoading: workspacesLoading } = useWorkspaceContext()
  const { user } = useAuth()
  const toast = useToast()
  const [search, setSearch] = useState(initialSearch)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt'>('updatedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false)
  const [renameDocument, setRenameDocument] = useState<DocumentSummary | null>(null)
  const [moveDocument, setMoveDocument] = useState<DocumentSummary | null>(null)
  const [shareDocument, setShareDocument] = useState<DocumentSummary | null>(null)
  const [deleteDocument, setDeleteDocument] = useState<DocumentSummary | null>(null)
  const [createFolderParentId, setCreateFolderParentId] = useState<string | null>(null)
  const [folderDialog, setFolderDialog] = useState<{ mode: 'create' | 'rename'; folder?: FolderSummary } | null>(null)
  const [deleteFolder, setDeleteFolder] = useState<FolderSummary | null>(null)
  const workspaceId = activeWorkspace?.id

  useEffect(() => {
    setSearch(initialSearch)
    setPage(1)
  }, [initialSearch])
  useEffect(() => {
    setSelectedFolderId(null)
    setPage(1)
  }, [workspaceId])

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: '20', sortBy, sortDirection })
    if (search.trim()) params.set('search', search.trim())
    if (selectedFolderId) params.set('folderId', selectedFolderId)
    return params.toString()
  }, [page, search, selectedFolderId, sortBy, sortDirection])
  const documentsKey = workspaceId ? `/api/workspaces/${workspaceId}/documents?${query}` : null
  const foldersKey = workspaceId ? `/api/workspaces/${workspaceId}/folders` : null
  const { data, error, isLoading, mutate } = useSWR<PaginatedResult<DocumentSummary>, ApiError>(documentsKey, apiFetcher, { keepPreviousData: true })
  const { data: folders, error: foldersError, isLoading: foldersLoading, mutate: mutateFolders } = useSWR<FolderSummary[], ApiError>(foldersKey, apiFetcher)
  const visibleFolders = folders ?? []
  const folderNames = useMemo(() => new Map(visibleFolders.map((folder) => [folder.id, folder.name])), [visibleFolders])
  const ancestors = useMemo(() => getAncestors(selectedFolderId, visibleFolders), [selectedFolderId, visibleFolders])
  const loadError = error ?? foldersError

  const refresh = async () => {
    if (!workspaceId) return
    await mutate()
    await mutateFolders()
    await refreshWorkspaceData(workspaceId)
  }

  const createDocument = async (values: { title: string; description: string; folderId: string | null }) => {
    if (!workspaceId) return
    const created = await apiRequest<DocumentSummary>(`/workspaces/${workspaceId}/documents`, {
      method: 'POST',
      body: { title: values.title, description: values.description || undefined, folderId: values.folderId },
    })
    await refresh()
    toast(`“${created.title}” created.`)
  }

  const saveDocument = async (values: { title: string; description: string }) => {
    if (!renameDocument) return
    await apiRequest(`/documents/${renameDocument.id}`, {
      method: 'PATCH',
      body: { title: values.title, description: values.description || null },
    })
    await refresh()
    toast('Document details saved.')
    setRenameDocument(null)
  }

  const moveDocumentTo = async (folderId: string | null) => {
    if (!moveDocument) return
    await apiRequest(`/documents/${moveDocument.id}`, { method: 'PATCH', body: { folderId } })
    await refresh()
    toast('Document moved.')
    setMoveDocument(null)
  }

  const createFolder = async (values: { name: string; parentFolderId?: string | null }) => {
    if (!workspaceId) return
    await apiRequest(`/workspaces/${workspaceId}/folders`, {
      method: 'POST',
      body: { name: values.name, parentFolderId: values.parentFolderId ?? null },
    })
    await refresh()
    toast(`Folder “${values.name}” created.`)
    setFolderDialog(null)
  }

  const renameFolder = async (values: { name: string }) => {
    if (!folderDialog?.folder) return
    await apiRequest(`/folders/${folderDialog.folder.id}`, { method: 'PATCH', body: { name: values.name } })
    await refresh()
    toast('Folder renamed.')
    setFolderDialog(null)
  }

  const onAction = async (action: DocumentAction, document: DocumentSummary) => {
    if (action === 'rename') setRenameDocument(document)
    if (action === 'move') setMoveDocument(document)
    if (action === 'share') setShareDocument(document)
    if (action === 'delete') setDeleteDocument(document)
    if (action === 'duplicate') {
      try {
        const duplicate = await apiRequest<DocumentSummary>(`/documents/${document.id}/duplicate`, { method: 'POST' })
        await refresh()
        toast(`Created “${duplicate.title}”.`)
      } catch (cause) {
        toast(cause instanceof ApiError ? cause.message : 'Could not duplicate this document.')
      }
    }
    if (action === 'archive') {
      try {
        await apiRequest(`/documents/${document.id}`, { method: 'PATCH', body: { isArchived: true } })
        await refresh()
        toast(`Archived “${document.title}”.`)
      } catch (cause) {
        toast(cause instanceof ApiError ? cause.message : 'Could not archive this document.')
      }
    }
  }

  const removeDocument = async () => {
    if (!deleteDocument) return
    await apiRequest<void>(`/documents/${deleteDocument.id}`, { method: 'DELETE' })
    await refresh()
    toast(`Deleted “${deleteDocument.title}”.`)
    setDeleteDocument(null)
  }

  const removeFolder = async () => {
    if (!deleteFolder) return
    await apiRequest<void>(`/folders/${deleteFolder.id}`, { method: 'DELETE' })
    await refresh()
    if (selectedFolderId === deleteFolder.id) setSelectedFolderId(null)
    toast(`Deleted “${deleteFolder.name}”. Documents were kept in its parent folder.`)
    setDeleteFolder(null)
  }

  if (workspacesLoading) return <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500" role="status">Loading your workspace…</div>
  if (!activeWorkspace) return <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center"><h1 className="text-lg font-semibold text-gray-900">No workspace selected</h1><p className="mt-2 text-sm text-gray-500">Create or join a workspace from the switcher to manage documents.</p></div>

  return <>
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="text-xs font-medium text-gray-500">{activeWorkspace.name}</p><h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-gray-950 sm:text-[30px]">Documents</h1><p className="mt-2 text-sm text-gray-500">Search, organize, and share documents you can access.</p></div>
      <Button type="button" onClick={() => setCreateDocumentOpen(true)} className="h-10 bg-indigo-600 px-3.5 text-white hover:bg-indigo-700"><Plus data-icon="inline-start" />Create document</Button>
    </div>

    <div className="mt-7 grid items-start gap-4 xl:grid-cols-[230px_minmax(0,1fr)]">
      <FolderSidebar
        folders={visibleFolders}
        selectedFolderId={selectedFolderId}
        currentUserId={user?.id ?? ''}
        workspaceRole={activeWorkspace.role}
        onSelect={(folderId) => { setSelectedFolderId(folderId); setPage(1) }}
        onCreate={(parentFolderId) => { setCreateFolderParentId(parentFolderId); setFolderDialog({ mode: 'create' }) }}
        onRename={(folder) => setFolderDialog({ mode: 'rename', folder })}
        onDelete={setDeleteFolder}
      />

      <section aria-label="Workspace documents" className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
            <button type="button" onClick={() => { setSelectedFolderId(null); setPage(1) }} className={`rounded-md px-2 py-1.5 ${selectedFolderId === null ? 'font-semibold text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>All documents</button>
            {selectedFolderId === 'root' && <><span className="text-gray-300">/</span><span className="px-1 text-gray-700">Unfiled</span></>}
            {ancestors.map((folder) => <span key={folder.id} className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="text-gray-300">/</span><button type="button" onClick={() => setSelectedFolderId(folder.id)} aria-current={selectedFolderId === folder.id ? 'page' : undefined} className={`max-w-40 truncate rounded-md px-2 py-1.5 ${selectedFolderId === folder.id ? 'font-semibold text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>{folder.name}</button></span>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative min-w-[190px] flex-1 sm:flex-none"><span className="sr-only">Search document titles</span><Search aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search titles" className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 sm:w-52" /></label>
            <label className="sr-only" htmlFor="document-sort">Sort documents</label><select id="document-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as 'updatedAt' | 'createdAt')} className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-600 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"><option value="updatedAt">Last updated</option><option value="createdAt">Date created</option></select>
            <Button type="button" variant="outline" size="icon" onClick={() => setSortDirection((current) => current === 'desc' ? 'asc' : 'desc')} aria-label={`Sort ${sortDirection === 'desc' ? 'oldest first' : 'newest first'}`} className="size-9">{sortDirection === 'desc' ? <ArrowDown /> : <ArrowUp />}</Button>
            <div className="flex rounded-lg border border-gray-200 p-0.5" aria-label="Document layout">
              <button type="button" onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'} className={`grid size-8 place-items-center rounded-md ${view === 'grid' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}><Grid2X2 aria-hidden="true" className="size-4" /></button>
              <button type="button" onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'} className={`grid size-8 place-items-center rounded-md ${view === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}><List aria-hidden="true" className="size-4" /></button>
            </div>
          </div>
        </div>

        {loadError && <p className="mt-4 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700" role="alert">{loadError.message}</p>}
        {isLoading ? <p className="mt-8 rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-500" role="status">Loading documents…</p> : data?.items.length ? view === 'grid' ? <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{data.items.map((document) => <DocumentCard key={document.id} document={document} folderName={document.folderId ? folderNames.get(document.folderId) : undefined} onAction={(action, item) => void onAction(action, item)} />)}</div> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[600px] text-left"><thead><tr className="text-[10px] font-semibold uppercase tracking-wider text-gray-400"><th className="pb-2 pr-3">Document</th><th className="hidden pb-2 pr-3 md:table-cell">Folder</th><th className="hidden pb-2 pr-3 sm:table-cell">Creator</th><th className="pb-2 pr-2">Updated</th><th className="pb-2 text-right"><span className="sr-only">Actions</span></th></tr></thead><tbody>{data.items.map((document) => <DocumentRow key={document.id} document={document} folderName={document.folderId ? folderNames.get(document.folderId) : undefined} onAction={(action, item) => void onAction(action, item)} />)}</tbody></table></div> : <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-6 py-14 text-center"><FileText aria-hidden="true" className="mx-auto size-6 text-gray-300" /><p className="mt-3 text-sm font-medium text-gray-700">{search ? 'No matching documents' : selectedFolderId ? 'This folder is empty' : 'No documents yet'}</p><p className="mt-1 text-xs text-gray-500">{search ? 'Try a different title or clear your search.' : 'Create a document to start building your workspace library.'}</p>{!search && <Button type="button" onClick={() => setCreateDocumentOpen(true)} className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700">Create document</Button>}</div>}

        <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-gray-500">{data?.total ?? 0} {data?.total === 1 ? 'document' : 'documents'}{search ? ' matching your search' : ''}</p><div className="flex items-center justify-end gap-2"><span className="text-xs text-gray-500">Page {data?.page ?? page} of {Math.max(data?.pageCount ?? 0, 1)}</span><Button type="button" variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button><Button type="button" variant="outline" size="sm" disabled={!data || page >= data.pageCount || isLoading} onClick={() => setPage((current) => current + 1)}>Next</Button></div></div>
      </section>
    </div>

    <DocumentFormDialog mode="create" open={createDocumentOpen} folders={visibleFolders} selectedFolderId={selectedFolderId} onClose={() => setCreateDocumentOpen(false)} onSave={createDocument} />
    <DocumentFormDialog mode="rename" open={Boolean(renameDocument)} document={renameDocument} folders={visibleFolders} selectedFolderId={selectedFolderId} onClose={() => setRenameDocument(null)} onSave={saveDocument} />
    <MoveDocumentDialog open={Boolean(moveDocument)} document={moveDocument} folders={visibleFolders} onClose={() => setMoveDocument(null)} onMove={moveDocumentTo} />
    <DocumentShareDialog document={shareDocument ? { ...shareDocument, content: {}, canRead: true } : null} open={Boolean(shareDocument)} onClose={() => setShareDocument(null)} />
    <ConfirmActionDialog open={Boolean(deleteDocument)} title="Delete document?" description={`“${deleteDocument?.title ?? ''}” will be soft-deleted. Its version history will be retained.`} confirmLabel="Delete document" onClose={() => setDeleteDocument(null)} onConfirm={removeDocument} />
    <FolderFormDialog mode={folderDialog?.mode ?? 'create'} open={Boolean(folderDialog)} folder={folderDialog?.folder} parentFolderId={createFolderParentId} folders={visibleFolders} onClose={() => setFolderDialog(null)} onSave={folderDialog?.mode === 'rename' ? renameFolder : createFolder} />
    <ConfirmActionDialog open={Boolean(deleteFolder)} title="Delete folder?" description={`“${deleteFolder?.name ?? ''}” will be removed. Its documents and subfolders will move to the parent folder.`} confirmLabel="Delete folder" onClose={() => setDeleteFolder(null)} onConfirm={removeFolder} />
    {foldersLoading && <span className="sr-only" role="status">Loading folders…</span>}
  </>
}

function getAncestors(selectedFolderId: string | null, folders: FolderSummary[]) {
  if (!selectedFolderId || selectedFolderId === 'root') return []
  const current = folders.find((folder) => folder.id === selectedFolderId)
  if (!current) return []
  const ancestors: FolderSummary[] = [current]
  let parentId = current.parentFolderId
  const visited = new Set<string>([current.id])
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId)
    const parent = folders.find((folder) => folder.id === parentId)
    if (!parent) break
    ancestors.unshift(parent)
    parentId = parent.parentFolderId
  }
  return ancestors
}
