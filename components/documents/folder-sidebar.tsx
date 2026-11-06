'use client'

import { useMemo } from 'react'
import type { FolderSummary } from '@syncspace/contracts'
import { ChevronRight, FileText, Folder, FolderPlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FolderTreeItem extends FolderSummary {
  children: FolderTreeItem[]
}

export function FolderSidebar({
  folders,
  selectedFolderId,
  currentUserId,
  workspaceRole,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: {
  folders: FolderSummary[]
  selectedFolderId: string | null
  currentUserId: string
  workspaceRole: 'OWNER' | 'ADMIN' | 'MEMBER'
  onSelect: (folderId: string | null) => void
  onCreate: (parentFolderId: string | null) => void
  onRename: (folder: FolderSummary) => void
  onDelete: (folder: FolderSummary) => void
}) {
  const roots = useMemo(() => buildTree(folders), [folders])
  return <aside className="rounded-xl border border-gray-200 bg-white p-3" aria-label="Document folders">
    <div className="flex items-center justify-between px-2 py-2"><h2 className="text-xs font-semibold text-gray-900">Folders</h2><Button type="button" variant="ghost" size="icon-sm" onClick={() => onCreate(null)} aria-label="Create a root folder"><FolderPlus /></Button></div>
    <nav aria-label="Folder filters" className="mt-1 flex flex-col gap-1">
      <button type="button" onClick={() => onSelect(null)} aria-current={selectedFolderId === null ? 'page' : undefined} className={`flex h-9 items-center gap-2 rounded-lg px-2.5 text-left text-xs transition ${selectedFolderId === null ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><FileText aria-hidden="true" className="size-4" />All documents</button>
      <button type="button" onClick={() => onSelect('root')} aria-current={selectedFolderId === 'root' ? 'page' : undefined} className={`flex h-9 items-center gap-2 rounded-lg px-2.5 text-left text-xs transition ${selectedFolderId === 'root' ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><Folder aria-hidden="true" className="size-4" />Unfiled</button>
      {roots.map((folder) => <FolderBranch key={folder.id} folder={folder} depth={0} selectedFolderId={selectedFolderId} currentUserId={currentUserId} workspaceRole={workspaceRole} onSelect={onSelect} onCreate={onCreate} onRename={onRename} onDelete={onDelete} />)}
    </nav>
    <div className="mt-4 border-t border-gray-100 px-2 pt-3"><p className="text-[11px] leading-5 text-gray-500">{folders.length} {folders.length === 1 ? 'folder' : 'folders'} in this workspace</p></div>
  </aside>
}

function FolderBranch({
  folder,
  depth,
  selectedFolderId,
  currentUserId,
  workspaceRole,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: {
  folder: FolderTreeItem
  depth: number
  selectedFolderId: string | null
  currentUserId: string
  workspaceRole: 'OWNER' | 'ADMIN' | 'MEMBER'
  onSelect: (folderId: string | null) => void
  onCreate: (parentFolderId: string | null) => void
  onRename: (folder: FolderSummary) => void
  onDelete: (folder: FolderSummary) => void
}) {
  const canManage = workspaceRole !== 'MEMBER' || folder.createdById === currentUserId
  return <div key={folder.id}>
    <div className={`group flex min-w-0 items-center rounded-lg transition ${selectedFolderId === folder.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`} style={{ paddingLeft: `${Math.min(depth * 14, 56)}px` }}>
      {depth > 0 && <ChevronRight aria-hidden="true" className="ml-2 size-3 shrink-0 rotate-0 text-gray-300" />}
      <button type="button" onClick={() => onSelect(folder.id)} aria-current={selectedFolderId === folder.id ? 'page' : undefined} className={`flex h-9 min-w-0 flex-1 items-center gap-2 px-2.5 text-left text-xs ${selectedFolderId === folder.id ? 'font-semibold text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}><Folder aria-hidden="true" className="size-4 shrink-0" /><span className="truncate">{folder.name}</span></button>
      {canManage && <details className="relative mr-1 shrink-0">
        <summary aria-label={`Actions for ${folder.name}`} className="grid size-7 list-none cursor-pointer place-items-center rounded-md text-gray-400 outline-none hover:bg-white hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-indigo-500"><MoreHorizontal aria-hidden="true" className="size-4" /></summary>
        <div className="absolute top-full right-0 z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          <button type="button" onClick={(event) => { event.currentTarget.closest('details')?.removeAttribute('open'); onCreate(folder.id) }} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"><FolderPlus aria-hidden="true" className="size-3.5" />New subfolder</button>
          <button type="button" onClick={(event) => { event.currentTarget.closest('details')?.removeAttribute('open'); onRename(folder) }} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"><Pencil aria-hidden="true" className="size-3.5" />Rename</button>
          <button type="button" onClick={(event) => { event.currentTarget.closest('details')?.removeAttribute('open'); onDelete(folder) }} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-red-600 hover:bg-red-50"><Trash2 aria-hidden="true" className="size-3.5" />Delete</button>
        </div>
      </details>}
    </div>
    {folder.children.map((child) => <FolderBranch key={child.id} folder={child} depth={depth + 1} selectedFolderId={selectedFolderId} currentUserId={currentUserId} workspaceRole={workspaceRole} onSelect={onSelect} onCreate={onCreate} onRename={onRename} onDelete={onDelete} />)}
  </div>
}

function buildTree(folders: FolderSummary[]): FolderTreeItem[] {
  const nodes = new Map(folders.map((folder) => [folder.id, { ...folder, children: [] as FolderTreeItem[] }]))
  const roots: FolderTreeItem[] = []
  for (const node of nodes.values()) {
    const parent = node.parentFolderId ? nodes.get(node.parentFolderId) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  const sort = (items: FolderTreeItem[]) => {
    items.sort((left, right) => left.name.localeCompare(right.name))
    items.forEach((item) => sort(item.children))
  }
  sort(roots)
  return roots
}
