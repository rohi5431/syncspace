'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Cloud, CloudOff, LoaderCircle, RotateCw } from 'lucide-react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import type { DocumentDetail } from '@syncspace/contracts'
import { Button } from '@/components/ui/button'
import { EditorToolbar } from '@/components/editor/editor-toolbar'
import { useAuth } from '@/lib/api-client'
import { createDocumentExtensions } from '@/lib/editor/editor-extensions'
import {
  YjsWebSocketProvider,
  type CollaborationStatus,
  type RealtimeCollaborator,
} from '@/lib/editor/yjs-websocket-provider'
import * as Y from 'yjs'

type CollaborativeDocumentEditorProps = {
  document: DocumentDetail
  onEditorReady?: (editor: Editor | null) => void
  onProviderReady?: (provider: YjsWebSocketProvider | null) => void
  onPresenceChange?: (collaborators: RealtimeCollaborator[]) => void
  onStatusChange?: (status: CollaborationStatus) => void
}

export function CollaborativeDocumentEditor({
  document,
  onEditorReady,
  onProviderReady,
  onPresenceChange,
  onStatusChange,
}: CollaborativeDocumentEditorProps) {
  const { user } = useAuth()
  const yDocument = useMemo(() => new Y.Doc(), [document.id])
  const provider = useMemo(() => new YjsWebSocketProvider(
    document.id,
    yDocument,
    { id: user?.id, name: user?.name, avatarUrl: user?.avatarUrl },
    document.canEdit,
  ), [document.id, yDocument])
  const extensions = useMemo(() => createDocumentExtensions(provider), [provider])
  const editor = useEditor({
    extensions,
    editable: document.canEdit,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'ProseMirror min-h-[34rem] px-5 py-7 outline-none sm:px-10 sm:py-10',
        'aria-label': `${document.title} editor`,
        spellcheck: 'true',
      },
    },
  }, [document.id, provider])

  const [canEdit, setCanEdit] = useState(document.canEdit)
  const [status, setStatus] = useState<CollaborationStatus>(provider.connectionStatus)
  const [collaborators, setCollaborators] = useState<RealtimeCollaborator[]>([])
  const [connectionError, setConnectionError] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const providerGeneration = useRef(0)

  useEffect(() => {
    if (user) provider.updateIdentity({ id: user.id, name: user.name, avatarUrl: user.avatarUrl })
  }, [provider, user?.id, user?.name, user?.avatarUrl])

  useEffect(() => {
    const generation = ++providerGeneration.current
    const handleStatus = ({ status: nextStatus }: { status: CollaborationStatus }) => {
      setStatus(nextStatus)
      onStatusChange?.(nextStatus)
    }
    const handlePermissions = ({ canEdit: nextCanEdit }: { canEdit: boolean }) => {
      setCanEdit(nextCanEdit)
      setConnectionError('')
    }
    const handlePresence = (nextCollaborators: RealtimeCollaborator[]) => {
      setCollaborators(nextCollaborators)
      onPresenceChange?.(nextCollaborators)
    }
    const handleError = ({ message }: { message: string }) => setConnectionError(message)

    provider.on('status', handleStatus)
    provider.on('permissions', handlePermissions)
    provider.on('presence', handlePresence)
    provider.on('error', handleError)
    onProviderReady?.(provider)
    onStatusChange?.(provider.connectionStatus)
    provider.connect()

    return () => {
      provider.off('status', handleStatus)
      provider.off('permissions', handlePermissions)
      provider.off('presence', handlePresence)
      provider.off('error', handleError)
      onProviderReady?.(null)
      queueMicrotask(() => {
        if (providerGeneration.current === generation) provider.destroy()
      })
    }
  }, [provider, onProviderReady, onPresenceChange, onStatusChange])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(canEdit)
    onEditorReady?.(editor)
    const updateWordCount = () => {
      const text = editor.getText().trim()
      setWordCount(text ? text.split(/\s+/).filter(Boolean).length : 0)
    }
    updateWordCount()
    editor.on('update', updateWordCount)
    return () => {
      editor.off('update', updateWordCount)
      onEditorReady?.(null)
    }
  }, [editor, canEdit, onEditorReady])

  const retryConnection = useCallback(() => {
    setConnectionError('')
    provider.reconnect()
  }, [provider])

  return (
    <section aria-label="Collaborative document editor" className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_14px_40px_-28px_rgba(40,38,80,0.28)]">
      {editor ? <EditorToolbar editor={editor} disabled={!canEdit} /> : (
        <div aria-hidden="true" className="h-12 animate-pulse border-b border-border bg-surface-muted" />
      )}

      {editor ? <EditorContent editor={editor} /> : (
        <div aria-label="Loading editor" className="min-h-[34rem] animate-pulse px-5 py-10 sm:px-10">
          <div className="h-7 w-2/3 rounded bg-muted" />
          <div className="mt-8 h-3 w-full rounded bg-muted" />
          <div className="mt-3 h-3 w-5/6 rounded bg-muted" />
          <div className="mt-3 h-3 w-4/6 rounded bg-muted" />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted px-4 py-3 text-xs sm:px-6">
        <div className="flex min-w-0 items-center gap-2 text-muted-foreground" aria-live="polite">
          <StatusIcon status={status} />
          <span className="truncate">
            {!canEdit ? 'Read-only' : statusLabel(status)}
          </span>
          {status === 'error' && (
            <Button type="button" variant="ghost" size="xs" onClick={retryConnection} className="h-6 px-2 text-primary">
              <RotateCw aria-hidden="true" />Retry
            </Button>
          )}
          {status === 'synced' && canEdit && <span className="sr-only">All changes are saved to SyncSpace.</span>}
          {connectionError && <span className="sr-only">{connectionError}</span>}
        </div>
        <span className="shrink-0 text-muted-foreground" aria-label={`${wordCount} words`}>{wordCount} words</span>
      </div>
      {connectionError && status === 'error' && (
        <p role="alert" className="border-t border-error/15 bg-error/5 px-4 py-2.5 text-xs text-error sm:px-6">
          {connectionError}
        </p>
      )}
      {collaborators.length > 0 && <span className="sr-only">{collaborators.length} collaborators online.</span>}
    </section>
  )
}

function StatusIcon({ status }: { status: CollaborationStatus }) {
  if (status === 'synced') return <Check aria-hidden="true" className="size-3.5 text-success" />
  if (status === 'offline') return <CloudOff aria-hidden="true" className="size-3.5 text-warning" />
  if (status === 'error') return <CloudOff aria-hidden="true" className="size-3.5 text-error" />
  if (status === 'saving') return <Cloud aria-hidden="true" className="size-3.5 text-primary" />
  return <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin text-primary" />
}

function statusLabel(status: CollaborationStatus): string {
  if (status === 'synced') return 'Saved to SyncSpace'
  if (status === 'saving') return 'Saving changes'
  if (status === 'offline') return 'Offline · changes are stored on this device'
  if (status === 'error') return 'Collaboration unavailable'
  if (status === 'syncing') return 'Syncing document'
  return 'Connecting to SyncSpace'
}
