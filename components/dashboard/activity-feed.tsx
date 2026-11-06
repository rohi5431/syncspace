'use client'

import type { WorkspaceActivityItem } from '@syncspace/contracts'
import { FileText, Folder, Users2, Building2 } from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { getInitials } from '@/lib/api-client'
import { formatRelativeDate } from '@/lib/date-format'

const actionCopy: Record<string, string> = {
  'workspace.created': 'created the workspace',
  'workspace.updated': 'updated workspace settings',
  'document.created': 'created a document',
  'document.renamed': 'renamed a document',
  'document.updated': 'updated document details',
  'document.content_updated': 'updated a document',
  'document.archived': 'archived a document',
  'document.deleted': 'deleted a document',
  'document.duplicated': 'duplicated a document',
  'document.shared': 'shared a document',
  'document.permission_updated': 'changed document access',
  'document.permission_removed': 'removed document access',
  'folder.created': 'created a folder',
  'folder.updated': 'updated a folder',
  'folder.deleted': 'deleted a folder',
  'member.added': 'added a workspace member',
  'member.role_updated': 'changed a member role',
  'member.removed': 'removed a workspace member',
}

export function ActivityFeed({ items, emptyMessage = 'Workspace activity will appear here.' }: { items: WorkspaceActivityItem[]; emptyMessage?: string }) {
  if (!items.length) return <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>

  return <ol className="divide-y divide-border">
    {items.map((item) => {
      const Icon = item.resourceType === 'document' ? FileText : item.resourceType === 'folder' ? Folder : item.resourceType === 'member' ? Users2 : Building2
      return <li key={item.id} className="flex items-start gap-3 py-3 first:pt-1 last:pb-1">
        <UserAvatar initials={getInitials(item.actor.name)} name={item.actor.name} size="sm" tone="slate" />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-5 text-foreground"><span className="font-medium text-foreground">{item.actor.name}</span>{' '}{actionCopy[item.action] ?? 'updated a workspace item'}{item.resourceName ? <> <span className="font-medium text-foreground">{item.resourceName}</span></> : null}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</p>
        </div>
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      </li>
    })}
  </ol>
}
