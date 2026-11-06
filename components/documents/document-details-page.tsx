'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import type { DocumentDetail, DocumentPermissionSummary, DocumentVersionSummary, PaginatedResult, WorkspaceActivityItem } from '@syncspace/contracts'
import type { Editor, JSONContent } from '@tiptap/core'
import { Archive, ArrowLeft, CalendarDays, Check, Cloud, CloudOff, FileClock, FileText, Heart, LoaderCircle, PanelRightClose, PanelRightOpen, RotateCcw, Save, Share2 } from 'lucide-react'
import { DocumentShareDialog } from '@/components/documents/document-share-dialog'
import { DocumentCollaborationSidebar } from '@/components/documents/document-collaboration-sidebar'
import { VersionPreviewModal } from '@/components/documents/version-preview-modal'
import { CollaborativeDocumentEditor } from '@/components/editor/collaborative-document-editor'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/providers/toast-provider'
import { ApiError, apiFetcher, apiRequest, getInitials, useAuth } from '@/lib/api-client'
import { formatFullDate, formatRelativeDate } from '@/lib/date-format'
import type { CollaborationStatus, RealtimeCollaborator, YjsWebSocketProvider } from '@/lib/editor/yjs-websocket-provider'

function collaborationStatusLabel(status: CollaborationStatus): string {
  if (status === 'synced') return 'Saved to SyncSpace'
  if (status === 'saving') return 'Saving changes'
  if (status === 'syncing') return 'Syncing document'
  if (status === 'offline') return 'Offline · local changes kept'
  if (status === 'error') return 'Connection issue'
  return 'Connecting'
}

export function DocumentDetailsPage({ documentId }: { documentId: string }) {
  const { user } = useAuth()
  const toast = useToast()
  const [sharingOpen, setSharingOpen] = useState(false)
  const [saveVersionOpen, setSaveVersionOpen] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [versionSummary, setVersionSummary] = useState('')
  const [savingVersion, setSavingVersion] = useState(false)
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null)
  const [documentEditor, setDocumentEditor] = useState<Editor | null>(null)
  const [realtimeProvider, setRealtimeProvider] = useState<YjsWebSocketProvider | null>(null)
  const [collaborators, setCollaborators] = useState<RealtimeCollaborator[]>([])
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(true)
  const [collaborationStatus, setCollaborationStatus] = useState<CollaborationStatus>('connecting')

  const documentKey = `/api/documents/${documentId}`
  const { data: document, error, isLoading, mutate } = useSWR<DocumentDetail, ApiError>(documentKey, apiFetcher)
  const versionsKey = document ? `/api/documents/${documentId}/versions?page=1&pageSize=20` : null
  const permissionsKey = document?.canManageSharing ? `/api/documents/${documentId}/permissions` : null
  const activityKey = document ? `/api/workspaces/${document.workspaceId}/activity?page=1&pageSize=50` : null
  const { data: versions, error: versionsError, isLoading: versionsLoading, mutate: mutateVersions } = useSWR<PaginatedResult<DocumentVersionSummary>, ApiError>(versionsKey, apiFetcher)
  const { data: permissions } = useSWR<DocumentPermissionSummary[]>(permissionsKey, apiFetcher)
  const { data: activityResult, mutate: mutateActivity } = useSWR<PaginatedResult<WorkspaceActivityItem>, ApiError>(activityKey, apiFetcher)
  const versionKey = selectedVersionId ? `/api/documents/${documentId}/versions/${selectedVersionId}` : null
  const { data: selectedVersion, error: selectedVersionError } = useSWR<DocumentVersionSummary, ApiError>(versionKey, apiFetcher)

  const handleEditorReady = useCallback((editor: Editor | null) => setDocumentEditor(editor), [])
  const handleProviderReady = useCallback((provider: YjsWebSocketProvider | null) => setRealtimeProvider(provider), [])
  const handlePresenceChange = useCallback((next: RealtimeCollaborator[]) => setCollaborators(next), [])
  const handleStatusChange = useCallback((next: CollaborationStatus) => setCollaborationStatus(next), [])

  const toggleFavorite = async () => {
    if (!document) return
    const nextFavorite = !document.isFavorite
    await mutate({ ...document, isFavorite: nextFavorite }, false)
    try {
      await apiRequest(`/documents/${documentId}/favorite`, { method: 'PATCH', body: { isFavorite: nextFavorite } })
      await mutate()
      toast(nextFavorite ? 'Added to favorites.' : 'Removed from favorites.')
    } catch (cause) {
      await mutate(document, false)
      toast(cause instanceof ApiError ? cause.message : 'Could not update this favorite.')
    }
  }

  const toggleArchive = async () => {
    if (!document) return
    try {
      await apiRequest(`/documents/${documentId}`, { method: 'PATCH', body: { isArchived: !document.isArchived } })
      await mutate()
      toast(document.isArchived ? 'Document restored.' : 'Document archived.')
    } catch (cause) {
      toast(cause instanceof ApiError ? cause.message : 'Could not update this document.')
    }
  }

  const saveVersion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!documentEditor || !realtimeProvider) {
      toast('The editor is still connecting. Try again once it is ready.')
      return
    }
    setSavingVersion(true)
    try {
      const durable = await realtimeProvider.flushAndWait()
      if (!durable) throw new Error('Reconnect to SyncSpace before saving a version.')
      await apiRequest(`/documents/${documentId}/versions`, {
        method: 'POST',
        body: {
          content: documentEditor.getJSON(),
          changeSummary: versionSummary.trim() || 'Manual snapshot',
        },
      })
      await Promise.all([mutate(), mutateVersions(), mutateActivity()])
      setVersionSummary('')
      setSaveVersionOpen(false)
      toast('Version snapshot saved.')
    } catch (cause) {
      toast(cause instanceof ApiError ? cause.message : cause instanceof Error ? cause.message : 'Could not save this version.')
    } finally {
      setSavingVersion(false)
    }
  }

  const restoreVersion = async (versionId: string) => {
    if (!documentEditor || !realtimeProvider || !document?.canEdit) return
    setRestoringVersionId(versionId)
    try {
      const currentChangesAreDurable = await realtimeProvider.flushAndWait()
      if (!currentChangesAreDurable) throw new Error('Reconnect to SyncSpace before restoring a version.')
      const snapshot = await apiRequest<Pick<DocumentVersionSummary, 'content' | 'versionNumber'>>(
        `/documents/${documentId}/versions/${versionId}/restore`,
        { method: 'POST' },
      )
      documentEditor.commands.setContent(snapshot.content as JSONContent, { emitUpdate: true })
      const restoreIsDurable = await realtimeProvider.flushAndWait()
      if (!restoreIsDurable) throw new Error('The restored content is on this device but could not be synchronized. Reconnect and try again.')
      await apiRequest(`/documents/${documentId}/versions`, {
        method: 'POST',
        body: {
          content: documentEditor.getJSON(),
          changeSummary: `Restored version ${snapshot.versionNumber}`,
        },
      })
      await Promise.all([mutate(), mutateVersions(), mutateActivity()])
      setSelectedVersionId(null)
      toast(`Version ${snapshot.versionNumber} restored and saved.`)
    } catch (cause) {
      toast(cause instanceof ApiError ? cause.message : cause instanceof Error ? cause.message : 'Could not restore this version.')
    } finally {
      setRestoringVersionId(null)
    }
  }

  if (isLoading) return <p className="rounded-2xl border border-border bg-white p-8 text-sm text-muted-foreground" role="status">Loading document…</p>
  if (error || !document) {
    return (
      <section className="rounded-2xl border border-error/20 bg-white p-6">
        <h1 className="text-lg font-semibold">Document unavailable</h1>
        <p className="mt-2 text-sm text-error">{error?.message ?? 'This document could not be found.'}</p>
        <Link href="/dashboard/documents" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Back to documents</Link>
      </section>
    )
  }

  const relatedPermissions = permissions ?? []
  const documentActivity = (activityResult?.items ?? []).filter((item) => item.resourceId === document.id)
  const roleLabel = document.createdById === user?.id
    ? 'Creator'
    : document.permissionRole ?? (document.canManageSharing ? 'Workspace admin' : 'Viewer')

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <li><Link href="/dashboard" className="transition hover:text-foreground">Workspace</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/dashboard/documents" className="transition hover:text-foreground">Documents</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="max-w-[14rem] truncate font-medium text-foreground">{document.title}</li>
          </ol>
        </nav>
        <Link href="/dashboard/documents" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-3.5" />All documents
        </Link>
      </div>

      <header className="mb-6 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
              <FileText aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-[30px]">{document.title}</h1>
              <p className="mt-1.5 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {document.description || 'A shared workspace document.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span aria-live="polite" className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${collaborationStatus === 'synced' ? 'bg-success-soft text-success' : collaborationStatus === 'offline' ? 'bg-warning-soft text-warning' : collaborationStatus === 'error' ? 'bg-error-soft text-error' : 'bg-accent text-primary'}`}>
                  {collaborationStatus === 'synced' ? <Check aria-hidden="true" className="size-3" /> : collaborationStatus === 'offline' || collaborationStatus === 'error' ? <CloudOff aria-hidden="true" className="size-3" /> : collaborationStatus === 'saving' ? <Cloud aria-hidden="true" className="size-3" /> : <LoaderCircle aria-hidden="true" className="size-3 animate-spin" />}
                  {collaborationStatusLabel(collaborationStatus)}
                </span>
                {collaborators.length > 0 && <div className="flex items-center gap-1.5" aria-label={`${collaborators.length} collaborators online`}>
                  <div className="flex -space-x-2">{collaborators.slice(0, 4).map((person) => <span key={person.id} className="rounded-full ring-2 ring-white"><UserAvatar initials={getInitials(person.name)} name={person.name} size="sm" status /></span>)}</div>
                  <span className="text-[10px] text-muted-foreground">{collaborators.length} online</span>
                </div>}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <UserAvatar initials={getInitials(document.createdBy.name)} name={document.createdBy.name} size="sm" tone="slate" />
                  <span>By <span className="font-medium text-foreground">{document.createdBy.name}</span></span>
                </span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-3.5" />Created {formatFullDate(document.createdAt)}</span>
                <span className="inline-flex items-center gap-1.5"><FileClock aria-hidden="true" className="size-3.5" />Updated {formatRelativeDate(document.updatedAt)}</span>
                <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 font-medium text-foreground">{roleLabel}</span>
                {document.isArchived && <span className="rounded-full bg-warning/10 px-2.5 py-1 font-medium text-warning">Archived</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button type="button" variant="outline" size="icon" aria-label={detailsPanelOpen ? 'Hide document details panel' : 'Show document details panel'} aria-pressed={detailsPanelOpen} title={detailsPanelOpen ? 'Hide details panel' : 'Show details panel'} onClick={() => setDetailsPanelOpen((open) => !open)}>
              {detailsPanelOpen ? <PanelRightClose aria-hidden="true" /> : <PanelRightOpen aria-hidden="true" />}
            </Button>
            <Button
              type="button"
              variant={document.isFavorite ? 'secondary' : 'outline'}
              size="icon"
              aria-label={document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={document.isFavorite}
              title={document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={() => void toggleFavorite()}
            >
              <Heart aria-hidden="true" className={document.isFavorite ? 'fill-current text-primary' : ''} />
            </Button>
            <Button type="button" variant="outline" onClick={() => setSharingOpen(true)} disabled={!document.canManageSharing} title={document.canManageSharing ? 'Share this document' : 'Only the owner or a workspace administrator can manage access'}>
              <Share2 aria-hidden="true" />Share
            </Button>
            {document.canEdit && (
              <Button type="button" variant="outline" onClick={() => setSaveVersionOpen(true)}>
                <Save aria-hidden="true" />Save version
              </Button>
            )}
            {document.canEdit && (
              <Button type="button" variant="ghost" onClick={() => void toggleArchive()}>
                {document.isArchived ? <RotateCcw aria-hidden="true" /> : <Archive aria-hidden="true" />}
                {document.isArchived ? 'Restore' : 'Archive'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className={`grid items-start gap-5 ${detailsPanelOpen ? 'xl:grid-cols-[minmax(0,1fr)_320px]' : 'grid-cols-1'}`}>
        <CollaborativeDocumentEditor
          document={document}
          onEditorReady={handleEditorReady}
          onProviderReady={handleProviderReady}
          onPresenceChange={handlePresenceChange}
          onStatusChange={handleStatusChange}
        />
        {detailsPanelOpen && <DocumentCollaborationSidebar
          document={document}
          currentUserId={user?.id}
          collaborators={collaborators}
          permissions={relatedPermissions}
          versions={versions?.items ?? []}
          versionsTotal={versions?.total ?? 0}
          versionsLoading={versionsLoading}
          versionsError={versionsError?.message}
          activity={documentActivity}
          onShare={() => setSharingOpen(true)}
          onPreviewVersion={setSelectedVersionId}
          onRestoreVersion={(versionId) => void restoreVersion(versionId)}
          restoringVersionId={restoringVersionId}
        />}
      </div>

      <DocumentShareDialog document={document} open={sharingOpen} onClose={() => setSharingOpen(false)} />
      <Modal
        open={saveVersionOpen}
        onClose={() => setSaveVersionOpen(false)}
        title="Save a version"
        description="Create an immutable snapshot of the latest synchronized document content."
      >
        <form onSubmit={saveVersion} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="version-summary">Snapshot name</FieldLabel>
              <Input
                id="version-summary"
                value={versionSummary}
                onChange={(event) => setVersionSummary(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
                }}
                placeholder="Quarterly plan approved"
                maxLength={160}
              />
              <FieldDescription>Leave blank to save a snapshot named “Manual snapshot”.</FieldDescription>
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setSaveVersionOpen(false)} disabled={savingVersion}>Cancel</Button>
            <Button type="submit" disabled={savingVersion}>{savingVersion ? 'Saving…' : 'Save snapshot'}</Button>
          </div>
        </form>
      </Modal>
      {selectedVersionId && (
        <VersionPreviewModal
          version={selectedVersion}
          error={selectedVersionError?.message}
          canRestore={document.canEdit}
          restoring={restoringVersionId === selectedVersionId}
          onRestore={() => void restoreVersion(selectedVersionId)}
          onClose={() => setSelectedVersionId(null)}
        />
      )}
    </>
  )
}
