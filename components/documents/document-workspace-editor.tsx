'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { io, type Socket } from 'socket.io-client'
import type { DocumentSummary } from '@/components/dashboard/dashboard-types'

interface DocumentRecord extends DocumentSummary {
  content: string
}

interface DocumentComment {
  id: string
  content: string
  authorName: string
  createdAt: string
}

interface DocumentVersion {
  id: string
  authorName: string
  createdAt: string
}

interface DocumentFile {
  fileId: string
  filename: string
  size: number
  mimetype: string
  downloadUrl: string
}

function decodeBase64(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

function encodeBase64(value: Uint8Array) {
  let binary = ''
  for (const byte of value) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function DocumentWorkspaceEditor({ document }: { document: DocumentSummary }) {
  const ydoc = useMemo(() => new Y.Doc(), [document.id])
  const [record, setRecord] = useState<DocumentRecord | null>(null)
  const [ready, setReady] = useState(false)
  const [connection, setConnection] = useState<'connecting' | 'connected' | 'offline'>('connecting')
  const [text, setText] = useState(document.content ?? '')
  const [comments, setComments] = useState<DocumentComment[]>([])
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [files, setFiles] = useState<DocumentFile[]>([])
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const socketRef = useRef<Socket | null>(null)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      Collaboration.configure({ document: ydoc }),
    ],
    editable: ready,
    immediatelyRender: false,
  }, [ready, document.id])

  useEffect(() => {
    let active = true
    const socket = io(process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:3002')
    socketRef.current = socket
    const onConnect = () => {
      setConnection('connected')
      socket.emit('join_document', { documentId: document.id })
    }
    const onDisconnect = () => setConnection('offline')
    const onEvent = (event: { type?: string; payload?: { id?: string; documentId?: string; update?: string } }) => {
      if (event.type === 'document:restored' && event.payload?.id === document.id) {
        window.location.reload()
        return
      }
      if (event.type === 'document:y-update'
        && event.payload?.documentId === document.id
        && event.payload.update) {
        Y.applyUpdate(ydoc, decodeBase64(event.payload.update), 'remote')
      }
    }
    const onDocumentChanged = (event: { documentId?: string; delta?: string }) => {
      if (event.documentId === document.id && event.delta) {
        Y.applyUpdate(ydoc, decodeBase64(event.delta), 'remote')
      }
    }
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('server:event', onEvent)
    socket.on('document:changed', onDocumentChanged)

    const initialize = async () => {
      try {
        const [documentResponse, updatesResponse] = await Promise.all([
          fetch(`/api/documents/${encodeURIComponent(document.id)}`),
          fetch(`/api/documents/${encodeURIComponent(document.id)}/updates`),
        ])
        if (!documentResponse.ok) throw new Error(await documentResponse.text() || 'Unable to load document')
        if (!updatesResponse.ok) throw new Error(await updatesResponse.text() || 'Unable to load collaboration history')
        const loadedDocument: DocumentRecord = await documentResponse.json()
        const updates: string[] = await updatesResponse.json()
        if (!active) return
        for (const update of updates) Y.applyUpdate(ydoc, decodeBase64(update), 'remote')
        setRecord(loadedDocument)
        setText(loadedDocument.content)
        if (updates.length === 0 && loadedDocument.content && editor) {
          editor.commands.setContent(loadedDocument.content)
          const initialState = encodeBase64(Y.encodeStateAsUpdate(ydoc))
          const response = await fetch(`/api/documents/${encodeURIComponent(document.id)}/updates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ update: initialState }),
          })
          if (!response.ok) throw new Error(await response.text() || 'Unable to initialize collaboration history')
        }
        setReady(true)
      } catch (initializeError) {
        if (active) setError(initializeError instanceof Error ? initializeError.message : 'Unable to load document')
      }
    }
    void initialize()
    return () => {
      active = false
      socket.emit('leave_document', { documentId: document.id })
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('server:event', onEvent)
      socket.off('document:changed', onDocumentChanged)
      socket.disconnect()
      socketRef.current = null
    }
  }, [document.id, editor, ydoc])

  useEffect(() => {
    if (!ready || !editor || document.editor !== 'rich-text') return
    const persistUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === 'remote') return
      void fetch(`/api/documents/${encodeURIComponent(document.id)}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ update: encodeBase64(update) }),
      }).then((response) => {
        if (!response.ok) throw new Error('Collaboration update could not be saved')
        socketRef.current?.emit('doc_change', {
          documentId: document.id,
          delta: encodeBase64(update),
        })
      }).catch((saveError: unknown) => {
        setError(saveError instanceof Error ? saveError.message : 'Collaboration update could not be saved')
      })
    }
    ydoc.on('update', persistUpdate)
    let saveTimer: number | undefined
    const saveContent = () => {
      window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(() => {
        const content = editor.getHTML()
        void fetch(`/api/documents/${encodeURIComponent(document.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }).then((response) => {
          if (!response.ok) throw new Error('Document content could not be saved')
          setRecord((previous) => previous ? { ...previous, content } : previous)
        }).catch((saveError: unknown) => {
          setError(saveError instanceof Error ? saveError.message : 'Document content could not be saved')
        })
      }, 700)
    }
    editor.on('update', saveContent)
    return () => {
      ydoc.off('update', persistUpdate)
      editor.off('update', saveContent)
      window.clearTimeout(saveTimer)
    }
  }, [document.editor, document.id, editor, ready, ydoc])

  useEffect(() => {
    if (!ready || document.editor === 'rich-text') return
    const timer = window.setTimeout(() => {
      void fetch(`/api/documents/${encodeURIComponent(document.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      }).then((response) => {
        if (!response.ok) throw new Error('Document content could not be saved')
      }).catch((saveError: unknown) => {
        setError(saveError instanceof Error ? saveError.message : 'Document content could not be saved')
      })
    }, 700)
    return () => window.clearTimeout(timer)
  }, [document.editor, document.id, ready, text])

  useEffect(() => {
    if (!ready) return
    void Promise.all([
      fetch(`/api/documents/${encodeURIComponent(document.id)}/comments`).then((response) => response.ok ? response.json() : []),
      fetch(`/api/documents/${encodeURIComponent(document.id)}/versions`).then((response) => response.ok ? response.json() : []),
      fetch(`/api/documents/${encodeURIComponent(document.id)}/files`).then((response) => response.ok ? response.json() : { files: [] }),
    ]).then(([loadedComments, loadedVersions, loadedFiles]) => {
      setComments(loadedComments)
      setVersions(loadedVersions)
      setFiles(loadedFiles.files)
    }).catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load document collaboration data')
    })
  }, [document.id, ready])

  const addComment = async () => {
    if (!comment.trim()) return
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(document.id)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment.trim() }),
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to post comment')
      const created: DocumentComment = await response.json()
      setComments((previous) => [...previous, created])
      setComment('')
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : 'Unable to post comment')
    }
  }

  const restoreVersion = async (versionId: string) => {
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(document.id)}/versions/${encodeURIComponent(versionId)}/restore`, { method: 'POST' })
      if (!response.ok) throw new Error(await response.text() || 'Unable to restore version')
      const updated: DocumentRecord = await response.json()
      setRecord(updated)
      setText(updated.content)
      setReady(false)
      window.location.reload()
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : 'Unable to restore version')
    }
  }

  const uploadFile = async (file?: File) => {
    if (!file) return
    const formData = new FormData()
    formData.set('file', file)
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(document.id)}/files/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to upload file')
      const uploaded: DocumentFile = await response.json()
      setFiles((previous) => [...previous, uploaded])
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload file')
    }
  }

  return (
    <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="min-w-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">{record?.type ?? document.type ?? 'Document'} · {document.editor ?? 'rich-text'}</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${connection === 'connected' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {connection === 'connected' ? 'Live collaboration connected' : connection === 'offline' ? 'Realtime unavailable' : 'Connecting…'}
          </span>
        </div>
        {!ready && <p className="text-sm text-gray-500">Loading document content…</p>}
        {document.editor === 'rich-text' ? (
          <div className="min-h-[28rem] rounded-2xl border border-gray-200 p-5">
            <EditorContent editor={editor} className="prose prose-slate max-w-none focus:outline-none" />
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              aria-label="Document content"
              disabled={!ready}
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-[28rem] w-full rounded-2xl border border-gray-200 p-5 font-mono text-sm leading-6 outline-none focus:border-indigo-400"
            />
            {document.editor === 'markdown' && (
              <pre className="min-h-24 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-gray-600">{text}</pre>
            )}
          </div>
        )}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="rounded-2xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">Discussion</h3>
          <div className="mt-3 space-y-3">
            {comments.map((item) => (
              <div key={item.id} className="rounded-xl bg-gray-50 p-3">
                <p className="text-sm text-gray-700">{item.content}</p>
                <p className="mt-1 text-xs text-gray-400">{item.authorName} · {new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment…" className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm" />
            <button type="button" onClick={() => void addComment()} className="rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white">Post</button>
          </div>
        </div>
      </section>
      <aside className="space-y-5">
        <section>
          <h3 className="font-semibold text-gray-900">Version history</h3>
          <div className="mt-2 max-h-52 space-y-2 overflow-auto">
            {versions.map((version) => (
              <div key={version.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 p-2">
                <span className="truncate text-xs text-gray-600">{new Date(version.createdAt).toLocaleString()}</span>
                <button type="button" onClick={() => void restoreVersion(version.id)} className="text-xs font-semibold text-indigo-600">Restore</button>
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900">Attachments</h3>
            <label className="cursor-pointer text-xs font-semibold text-indigo-600">
              Upload
              <input type="file" className="sr-only" onChange={(event) => { void uploadFile(event.target.files?.[0]); event.currentTarget.value = '' }} />
            </label>
          </div>
          <div className="mt-2 space-y-2">
            {files.map((file) => (
              <a key={file.fileId} href={file.downloadUrl} target="_blank" rel="noreferrer" className="block truncate rounded-lg border border-gray-100 p-2 text-xs text-indigo-600">
                {file.filename} · {Math.ceil(file.size / 1024)} KB
              </a>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}
