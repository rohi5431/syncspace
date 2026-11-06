'use client'

import Link from 'next/link'
import type { DocumentSummary } from '@syncspace/contracts'
import { Archive, Copy, FileText, FolderInput, Heart, MoreHorizontal, Pencil, Share2, Star, Trash2 } from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { formatRelativeDate } from '@/lib/date-format'
import { getInitials } from '@/lib/api-client'

export type DocumentAction = 'rename' | 'duplicate' | 'move' | 'share' | 'archive' | 'favorite' | 'delete'

export function DocumentCard({ document, folderName, onAction }: { document: DocumentSummary; folderName?: string; onAction: (action: DocumentAction, document: DocumentSummary) => void }) {
  return <article className="group relative rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <Link href={`/dashboard/documents/${document.id}`} className="grid size-9 place-items-center rounded-lg border border-border bg-surface-muted text-primary"><FileText aria-hidden="true" className="size-[17px]" /></Link>
      <div className="flex items-center gap-1.5">
        {document.isFavorite && <span title="Favorite" aria-label="Favorite document" className="grid size-7 place-items-center rounded-full bg-accent text-primary"><Heart aria-hidden="true" className="size-3.5 fill-current" /></span>}
        <DocumentActionMenu document={document} onAction={onAction} />
      </div>
    </div>
    <Link href={`/dashboard/documents/${document.id}`} className="block">
      <h3 className="mt-4 truncate text-sm font-semibold text-foreground hover:text-primary-hover">{document.title}</h3>
      <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{document.description || 'No description yet.'}</p>
    </Link>
    <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
      <span className="min-w-0"><span className="block truncate text-[11px] text-muted-foreground">{folderName ?? 'Unfiled'}</span><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">Updated {formatRelativeDate(document.updatedAt)}</span></span>
      <UserAvatar initials={getInitials(document.createdBy.name)} name={document.createdBy.name} size="sm" tone="slate" />
    </div>
  </article>
}

export function DocumentRow({ document, folderName, onAction }: { document: DocumentSummary; folderName?: string; onAction: (action: DocumentAction, document: DocumentSummary) => void }) {
  return <tr className="border-t border-border first:border-t-0">
    <td className="py-3 pr-3"><Link href={`/dashboard/documents/${document.id}`} className="flex min-w-0 items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-primary"><FileText aria-hidden="true" className="size-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-medium text-foreground hover:text-primary-hover">{document.title}</span><span className="block truncate text-xs text-muted-foreground">{document.description || 'No description yet.'}</span></span></Link></td>
    <td className="hidden py-3 pr-3 text-xs text-muted-foreground md:table-cell">{folderName ?? 'Unfiled'}</td>
    <td className="hidden py-3 pr-3 text-xs text-muted-foreground sm:table-cell">{document.createdBy.name}</td>
    <td className="py-3 pr-2 text-xs text-muted-foreground">{formatRelativeDate(document.updatedAt)}</td>
    <td className="py-3 text-right"><DocumentActionMenu document={document} onAction={onAction} /></td>
  </tr>
}

function DocumentActionMenu({ document, onAction }: { document: DocumentSummary; onAction: (action: DocumentAction, document: DocumentSummary) => void }) {
  const actions: { action: DocumentAction; label: string; icon: typeof Pencil; destructive?: boolean; visible: boolean }[] = [
    { action: 'rename', label: 'Rename', icon: Pencil, visible: document.canEdit },
    { action: 'duplicate', label: 'Duplicate', icon: Copy, visible: document.canEdit },
    { action: 'move', label: 'Move', icon: FolderInput, visible: document.canEdit },
    { action: 'share', label: 'Share', icon: Share2, visible: document.canManageSharing },
    { action: 'favorite', label: document.isFavorite ? 'Remove favorite' : 'Add to favorites', icon: document.isFavorite ? Heart : Star, visible: true },
    { action: 'archive', label: 'Archive', icon: Archive, visible: document.canEdit },
    { action: 'delete', label: 'Delete', icon: Trash2, destructive: true, visible: document.canDelete },
  ]
  return <details className="relative">
    <summary aria-label={`Actions for ${document.title}`} className="grid size-8 list-none cursor-pointer place-items-center rounded-lg text-muted-foreground outline-none transition hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"><MoreHorizontal aria-hidden="true" className="size-4" /></summary>
    <div role="menu" aria-label={`Actions for ${document.title}`} className="absolute top-full right-0 z-20 mt-1 w-36 rounded-lg border border-border bg-white p-1 shadow-lg">
      {actions.filter((item) => item.visible).map(({ action, label, icon: Icon, destructive }) => <button key={action} type="button" role="menuitem" onClick={(event) => { event.currentTarget.closest('details')?.removeAttribute('open'); onAction(action, document) }} className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs transition ${destructive ? 'text-error hover:bg-error-soft' : 'text-foreground hover:bg-surface-muted'}`}><Icon aria-hidden="true" className="size-3.5" />{label}</button>)}
      {!actions.some((item) => item.visible) && <p className="px-2 py-2 text-xs text-muted-foreground">View only</p>}
    </div>
  </details>
}
