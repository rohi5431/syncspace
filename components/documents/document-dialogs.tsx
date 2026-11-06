'use client'

import { useEffect, useState } from 'react'
import type { DocumentSummary, FolderSummary } from '@syncspace/contracts'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { ApiError } from '@/lib/api-client'

export interface DocumentFormValues {
  title: string
  description: string
  folderId: string | null
}

export function DocumentFormDialog({
  mode,
  open,
  document,
  folders,
  selectedFolderId,
  onClose,
  onSave,
}: {
  mode: 'create' | 'rename'
  open: boolean
  document?: DocumentSummary | null
  folders: FolderSummary[]
  selectedFolderId: string | null
  onClose: () => void
  onSave: (values: DocumentFormValues) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [folderId, setFolderId] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(mode === 'rename' ? document?.title ?? '' : '')
    setDescription(mode === 'rename' ? document?.description ?? '' : '')
    setFolderId(mode === 'create' && selectedFolderId && selectedFolderId !== 'root' ? selectedFolderId : '')
    setError('')
  }, [document?.id, mode, open, selectedFolderId])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedTitle = title.trim()
    if (!normalizedTitle) return
    setSaving(true)
    setError('')
    try {
      await onSave({ title: normalizedTitle, description: description.trim(), folderId: folderId || null })
      onClose()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not save this document.')
    } finally {
      setSaving(false)
    }
  }

  const heading = mode === 'create' ? 'Create a document' : 'Rename document'
  const titleId = mode === 'create' ? 'create-document-title' : 'rename-document-title'
  return <Modal open={open} onClose={onClose} title={heading} description={mode === 'create' ? 'Start a document in this workspace.' : 'Update this document’s title and description.'}>
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div><label htmlFor={titleId} className="mb-1.5 block text-sm font-medium text-gray-700">Document title</label><input id={titleId} required minLength={1} maxLength={200} autoComplete="off" value={title} onChange={(event) => setTitle(event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></div>
      <div><label htmlFor={`${titleId}-description`} className="mb-1.5 block text-sm font-medium text-gray-700">Description <span className="font-normal text-gray-400">(optional)</span></label><textarea id={`${titleId}-description`} rows={3} maxLength={5000} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></div>
      {mode === 'create' && <div><label htmlFor="create-document-folder" className="mb-1.5 block text-sm font-medium text-gray-700">Folder</label><select id="create-document-folder" value={folderId} onChange={(event) => setFolderId(event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"><option value="">No folder</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folderPath(folder, folders)}</option>)}</select></div>}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving} className="bg-indigo-600 text-white hover:bg-indigo-700">{saving ? 'Saving…' : mode === 'create' ? 'Create document' : 'Save changes'}</Button></div>
    </form>
  </Modal>
}

export function MoveDocumentDialog({
  open,
  document,
  folders,
  onClose,
  onMove,
}: {
  open: boolean
  document: DocumentSummary | null
  folders: FolderSummary[]
  onClose: () => void
  onMove: (folderId: string | null) => Promise<void>
}) {
  const [folderId, setFolderId] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setFolderId(document?.folderId ?? '')
    setError('')
  }, [document?.id, open])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onMove(folderId || null)
      onClose()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not move this document.')
    } finally {
      setSaving(false)
    }
  }

  return <Modal open={open} onClose={onClose} title="Move document" description={`Choose a folder for “${document?.title ?? ''}”.`}>
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div><label htmlFor="move-document-folder" className="mb-1.5 block text-sm font-medium text-gray-700">Destination folder</label><select id="move-document-folder" value={folderId} onChange={(event) => setFolderId(event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"><option value="">No folder</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folderPath(folder, folders)}</option>)}</select></div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving} className="bg-indigo-600 text-white hover:bg-indigo-700">{saving ? 'Moving…' : 'Move document'}</Button></div>
    </form>
  </Modal>
}

export function FolderFormDialog({
  mode,
  open,
  folder,
  parentFolderId,
  folders,
  onClose,
  onSave,
}: {
  mode: 'create' | 'rename'
  open: boolean
  folder?: FolderSummary | null
  parentFolderId: string | null
  folders: FolderSummary[]
  onClose: () => void
  onSave: (values: { name: string; parentFolderId?: string | null }) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(mode === 'rename' ? folder?.name ?? '' : '')
    setParentId(parentFolderId ?? '')
    setError('')
  }, [folder?.id, mode, open, parentFolderId])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedName = name.trim()
    if (!normalizedName) return
    setSaving(true)
    setError('')
    try {
      await onSave({ name: normalizedName, ...(mode === 'create' ? { parentFolderId: parentId || null } : {}) })
      onClose()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not save this folder.')
    } finally {
      setSaving(false)
    }
  }

  const id = mode === 'create' ? 'create-folder-name' : 'rename-folder-name'
  return <Modal open={open} onClose={onClose} title={mode === 'create' ? 'Create a folder' : 'Rename folder'} description={mode === 'create' ? 'Folders can be nested inside another folder.' : 'Choose a clear name for this folder.'}>
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">Folder name</label><input id={id} required minLength={1} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></div>
      {mode === 'create' && <div><label htmlFor="create-folder-parent" className="mb-1.5 block text-sm font-medium text-gray-700">Parent folder</label><select id="create-folder-parent" value={parentId} onChange={(event) => setParentId(event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"><option value="">Workspace root</option>{folders.map((item) => <option key={item.id} value={item.id}>{folderPath(item, folders)}</option>)}</select></div>}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving} className="bg-indigo-600 text-white hover:bg-indigo-700">{saving ? 'Saving…' : mode === 'create' ? 'Create folder' : 'Save name'}</Button></div>
    </form>
  </Modal>
}

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const confirm = async () => {
    setSaving(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'The action could not be completed.')
    } finally {
      setSaving(false)
    }
  }

  return <Modal open={open} onClose={onClose} title={title} description={description}>
    {error && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button type="button" variant="destructive" onClick={() => void confirm()} disabled={saving}>{saving ? 'Working…' : confirmLabel}</Button></div>
  </Modal>
}

function folderPath(folder: FolderSummary, folders: FolderSummary[]) {
  const names = [folder.name]
  let parentId = folder.parentFolderId
  const visited = new Set<string>([folder.id])
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId)
    const parent = folders.find((item) => item.id === parentId)
    if (!parent) break
    names.unshift(parent.name)
    parentId = parent.parentFolderId
  }
  return names.join(' / ')
}
