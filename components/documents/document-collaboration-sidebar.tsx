'use client'

import type {
  DocumentDetail,
  DocumentPermissionSummary,
  DocumentVersionSummary,
  WorkspaceActivityItem,
} from '@syncspace/contracts'
import {
  Activity,
  ArrowUpRight,
  Clock3,
  FileClock,
  History,
  LockKeyhole,
  UsersRound,
} from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/api-client'
import { formatFullDate, formatRelativeDate } from '@/lib/date-format'
import type { RealtimeCollaborator } from '@/lib/editor/yjs-websocket-provider'

type DocumentCollaborationSidebarProps = {
  document: DocumentDetail
  currentUserId?: string
  collaborators: RealtimeCollaborator[]
  permissions: DocumentPermissionSummary[]
  versions: DocumentVersionSummary[]
  versionsTotal: number
  versionsLoading: boolean
  versionsError?: string
  activity: WorkspaceActivityItem[]
  onShare: () => void
  onPreviewVersion: (versionId: string) => void
  onRestoreVersion: (versionId: string) => void
  restoringVersionId: string | null
}

export function DocumentCollaborationSidebar({
  document,
  currentUserId,
  collaborators,
  permissions,
  versions,
  versionsTotal,
  versionsLoading,
  versionsError,
  activity,
  onShare,
  onPreviewVersion,
  onRestoreVersion,
  restoringVersionId,
}: DocumentCollaborationSidebarProps) {
  const roleLabel = document.createdById === currentUserId
    ? 'Creator'
    : document.permissionRole ?? (document.canManageSharing ? 'Workspace admin' : 'Viewer')

  return (
    <aside aria-label="Document details and collaborators" className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UsersRound aria-hidden="true" className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Here now</h2>
          </div>
          <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">{collaborators.length} online</span>
        </div>
        {collaborators.length ? (
          <ul className="mt-4 flex flex-col gap-3">
            {collaborators.map((person) => (
              <li key={person.id} className="flex min-w-0 items-center gap-2.5">
                <UserAvatar initials={getInitials(person.name)} name={person.name} size="sm" status />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                  {person.id === currentUserId ? `${person.name} (you)` : person.name}
                </span>
                <span aria-label={`Active ${formatRelativeDate(person.lastActiveAt)}`} title={`Active ${formatRelativeDate(person.lastActiveAt)}`} className="size-2 rounded-full bg-success" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">Presence appears here when a teammate opens this document.</p>
        )}
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[11px] leading-5 text-muted-foreground">{document.collaboratorCount} people have direct access.</p>
          {document.canManageSharing && permissions.length > 0 && <ul className="mt-2 flex flex-col gap-2">{permissions.slice(0, 3).map((permission) => <li key={permission.id} className="flex min-w-0 items-center gap-2"><UserAvatar initials={getInitials(permission.user.name)} name={permission.user.name} size="sm" tone="slate" /><span className="min-w-0 flex-1 truncate text-[11px] text-foreground">{permission.user.name}</span><span className="text-[9px] uppercase text-muted-foreground">{permission.role.toLowerCase()}</span></li>)}</ul>}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={onShare}
          disabled={!document.canManageSharing}
          title={document.canManageSharing ? 'Manage document access' : 'Only the owner or a workspace administrator can manage access'}
        >
          <LockKeyhole aria-hidden="true" />
          Manage access
        </Button>
      </section>

      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FileClock aria-hidden="true" className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Document details</h2>
        </div>
        <dl className="mt-4 flex flex-col gap-3 text-xs">
          <DetailRow label="Owner" value={document.createdBy.name} />
          <DetailRow label="Your access" value={roleLabel} />
          <DetailRow label="Created" value={formatFullDate(document.createdAt)} />
          <DetailRow label="Last edited" value={formatRelativeDate(document.updatedAt)} />
          <DetailRow label="People with access" value={String(document.collaboratorCount)} />
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <History aria-hidden="true" className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Version history</h2>
          </div>
          <span className="text-[10px] text-muted-foreground">{versionsTotal}</span>
        </div>
        {versionsLoading ? (
          <p className="mt-4 text-xs text-muted-foreground" role="status">Loading versions…</p>
        ) : versionsError ? (
          <p className="mt-3 text-xs text-error" role="alert">{versionsError}</p>
        ) : versions.length ? (
          <ol className="mt-3 flex flex-col divide-y divide-border">
            {versions.slice(0, 7).map((version) => (
              <li key={version.id} className="flex items-center gap-2 py-3 first:pt-1 last:pb-1">
                <button
                  type="button"
                  onClick={() => onPreviewVersion(version.id)}
                  className="min-w-0 flex-1 rounded-md py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  aria-label={`Preview version ${version.versionNumber}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">Version {version.versionNumber}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{formatRelativeDate(version.createdAt)}</span>
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                    {version.changeSummary || `Saved by ${version.createdBy.name}`}
                  </span>
                </button>
                {document.canEdit && (
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Restore version ${version.versionNumber}`}
                    title={`Restore version ${version.versionNumber}`}
                    disabled={restoringVersionId === version.id}
                    onClick={() => onRestoreVersion(version.id)}
                  >
                    <ArrowUpRight aria-hidden="true" />
                  </Button>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">A version is created when you save a named snapshot.</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity aria-hidden="true" className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Recent activity</h2>
        </div>
        {activity.length ? (
          <ol className="mt-3 flex flex-col gap-3">
            {activity.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-start gap-2.5">
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                <div className="min-w-0">
                  <p className="text-xs leading-5 text-foreground">
                    <span className="font-medium">{item.actor.name}</span> {activityLabel(item.action)}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock3 aria-hidden="true" className="size-3" />{formatRelativeDate(item.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">Document events will appear here as they happen.</p>
        )}
      </section>
    </aside>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-foreground" title={value}>{value}</dd>
    </div>
  )
}

function activityLabel(action: string): string {
  const known: Record<string, string> = {
    'document.created': 'created this document',
    'document.updated': 'updated document details',
    'document.content_updated': 'updated the document content',
    'document.permission_updated': 'updated sharing access',
    'document.permission_removed': 'removed document access',
    'document.duplicated': 'duplicated this document',
    'document.archived': 'archived this document',
    'document.unarchived': 'restored this document',
    'document.version_created': 'saved a version snapshot',
  }
  if (known[action]) return known[action]
  return action.replace(/^document\./, '').replace(/[._-]/g, ' ')
}
