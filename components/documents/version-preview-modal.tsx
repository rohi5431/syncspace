'use client'

import { useMemo } from 'react'
import type { DocumentVersionSummary } from '@syncspace/contracts'
import { EditorContent, useEditor } from '@tiptap/react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { createDocumentExtensions } from '@/lib/editor/editor-extensions'
import { formatFullDate } from '@/lib/date-format'

type VersionPreviewModalProps = {
  version?: DocumentVersionSummary
  error?: string
  canRestore: boolean
  restoring: boolean
  onRestore: () => void
  onClose: () => void
}

export function VersionPreviewModal({
  version,
  error,
  canRestore,
  restoring,
  onRestore,
  onClose,
}: VersionPreviewModalProps) {
  const extensions = useMemo(() => createDocumentExtensions(), [])
  const editor = useEditor({
    extensions,
    content: version?.content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'ProseMirror max-h-[55vh] min-h-[12rem] overflow-y-auto px-5 py-5 text-sm',
        'aria-label': `Read-only preview of version ${version?.versionNumber ?? ''}`,
      },
    },
  }, [version?.id])

  return (
    <Modal
      open
      onClose={onClose}
      title={version ? `Version ${version.versionNumber}` : 'Version preview'}
      description={version ? `Saved by ${version.createdBy.name} · ${formatFullDate(version.createdAt)}` : 'Read-only document snapshot.'}
      size="md"
    >
      {error ? (
        <p className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error" role="alert">{error}</p>
      ) : version ? (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          {editor ? <EditorContent editor={editor} /> : <p className="p-5 text-sm text-muted-foreground" role="status">Loading version preview…</p>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground" role="status">Loading version snapshot…</p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        {version && canRestore && (
          <Button type="button" onClick={onRestore} disabled={restoring}>
            <RotateCcw aria-hidden="true" />{restoring ? 'Restoring…' : 'Restore this version'}
          </Button>
        )}
      </div>
    </Modal>
  )
}
