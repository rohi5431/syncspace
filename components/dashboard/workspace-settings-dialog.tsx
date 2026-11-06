'use client'

import { useState } from 'react'
import { useSWRConfig } from 'swr'
import type { WorkspaceSummary } from '@syncspace/contracts'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/providers/toast-provider'
import { ApiError, apiRequest, WORKSPACES_KEY } from '@/lib/api-client'
import { useWorkspaceContext } from '@/components/dashboard/workspace-provider'
import { refreshWorkspaceData } from '@/lib/workspace-data'

export function WorkspaceSettingsDialog({ workspace, open, onClose }: { workspace: WorkspaceSummary; open: boolean; onClose: () => void }) {
  const [name, setName] = useState(workspace.name)
  const [description, setDescription] = useState(workspace.description ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { workspaces, setSelectedWorkspaceId } = useWorkspaceContext()
  const { mutate } = useSWRConfig()
  const toast = useToast()
  const canDelete = workspace.role === 'OWNER'

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await apiRequest<WorkspaceSummary>(`/workspaces/${workspace.id}`, {
        method: 'PATCH',
        body: { name: name.trim(), description: description.trim() || null },
      })
      await mutate<WorkspaceSummary[]>(WORKSPACES_KEY, (current) => current?.map((item) => item.id === updated.id ? updated : item), { revalidate: false })
      await refreshWorkspaceData(workspace.id)
      toast('Workspace settings saved.')
      onClose()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not save workspace settings.')
    } finally {
      setSaving(false)
    }
  }

  const removeWorkspace = async () => {
    setSaving(true)
    setError('')
    try {
      await apiRequest<void>(`/workspaces/${workspace.id}`, { method: 'DELETE' })
      const remaining = workspaces.filter((item) => item.id !== workspace.id)
      await mutate<WorkspaceSummary[]>(WORKSPACES_KEY, remaining, { revalidate: false })
      if (remaining[0]) setSelectedWorkspaceId(remaining[0].id)
      toast(`Deleted ${workspace.name}.`)
      setConfirmDelete(false)
      onClose()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not delete this workspace.')
    } finally {
      setSaving(false)
    }
  }

  return <Modal open={open} onClose={onClose} title={confirmDelete ? 'Delete this workspace?' : 'Workspace settings'} description={confirmDelete ? 'This permanently removes the workspace and its documents for every member.' : 'Update the name and description shared with your team.'} size="md">
    {confirmDelete ? <div className="flex flex-col gap-4">
      <p className="rounded-lg border border-red-200 bg-white p-3 text-sm text-red-700">This action cannot be undone. All workspace content will be removed.</p>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setConfirmDelete(false)} disabled={saving}>Keep workspace</Button><Button type="button" variant="destructive" onClick={() => void removeWorkspace()} disabled={saving}>{saving ? 'Deleting…' : 'Delete workspace'}</Button></div>
    </div> : <form onSubmit={save} className="flex flex-col gap-4">
      <div><label htmlFor="settings-workspace-name" className="mb-1.5 block text-sm font-medium text-gray-700">Workspace name</label><input id="settings-workspace-name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></div>
      <div><label htmlFor="settings-workspace-description" className="mb-1.5 block text-sm font-medium text-gray-700">Description</label><textarea id="settings-workspace-description" rows={3} maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
        {canDelete ? <Button type="button" variant="destructive" onClick={() => { setError(''); setConfirmDelete(true) }} disabled={saving}>Delete workspace</Button> : <span />}
        <div className="flex gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving} className="bg-indigo-600 text-white hover:bg-indigo-700">{saving ? 'Saving…' : 'Save changes'}</Button></div>
      </div>
    </form>}
  </Modal>
}
