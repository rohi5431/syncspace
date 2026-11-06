'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import type { DocumentDetail, DocumentPermissionRole, DocumentPermissionSummary, PaginatedResult, WorkspaceMemberSummary } from '@syncspace/contracts'
import { Copy, Search, UsersRound } from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/providers/toast-provider'
import { ApiError, apiFetcher, apiRequest, getInitials } from '@/lib/api-client'
import { refreshWorkspaceData } from '@/lib/workspace-data'

export function DocumentShareDialog({
  document,
  open,
  onClose,
}: {
  document: DocumentDetail | null
  open: boolean
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const toast = useToast()
  const permissionKey = open && document?.canManageSharing ? `/api/documents/${document.id}/permissions` : null
  const membersKey = open && document?.canManageSharing ? `/api/workspaces/${document.workspaceId}/members?page=1&pageSize=100` : null
  const { data: permissions, error: permissionsError, isLoading: permissionsLoading, mutate: mutatePermissions } = useSWR<DocumentPermissionSummary[], ApiError>(permissionKey, apiFetcher)
  const { data: members, error: membersError, isLoading: membersLoading } = useSWR<PaginatedResult<WorkspaceMemberSummary>, ApiError>(membersKey, apiFetcher)
  const filteredMembers = useMemo(() => (members?.items ?? []).filter((member) => `${member.user.name} ${member.user.email}`.toLowerCase().includes(search.trim().toLowerCase())), [members?.items, search])

  const copyDocumentLink = async () => {
    if (!document) return
    const url = new URL(`/dashboard/documents/${document.id}`, window.location.origin).toString()
    try {
      await navigator.clipboard.writeText(url)
      toast('Private document link copied. Access is still permission-checked.')
    } catch {
      setErrorMessage('Clipboard access is unavailable in this browser.')
    }
  }

  const setPermission = async (member: WorkspaceMemberSummary, nextRole: DocumentPermissionRole | '') => {
    if (!document || !document.canManageSharing) return
    const current = permissions?.find((permission) => permission.userId === member.userId)
    if (!current && !nextRole) return
    if (current?.role === nextRole) return
    setSavingUserId(member.userId)
    setErrorMessage('')
    try {
      if (current && !nextRole) {
        await apiRequest<void>(`/documents/${document.id}/permissions/${current.id}`, { method: 'DELETE' })
        toast(`Removed access for ${member.user.name}.`)
      } else if (current) {
        await apiRequest(`/documents/${document.id}/permissions/${current.id}`, {
          method: 'PATCH',
          body: { role: nextRole },
        })
        toast(`Updated ${member.user.name}’s access.`)
      } else {
        await apiRequest(`/documents/${document.id}/share`, {
          method: 'POST',
          body: { email: member.user.email, role: nextRole },
        })
        toast(`Shared with ${member.user.name}.`)
      }
      await mutatePermissions()
      await refreshWorkspaceData(document.workspaceId)
    } catch (cause) {
      setErrorMessage(cause instanceof ApiError ? cause.message : 'Could not update document access.')
    } finally {
      setSavingUserId(null)
    }
  }

  const loading = permissionsLoading || membersLoading
  const error = permissionsError ?? membersError
  return <Modal open={open} onClose={onClose} title="Share document" description={document ? `Manage access to “${document.title}” for workspace members.` : 'Manage document access.'} size="md">
    <div className="flex flex-col gap-4">
      <div className="relative"><Search aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><label htmlFor="share-member-search" className="sr-only">Search workspace members</label><input id="share-member-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workspace members" className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20" /></div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>Workspace members</span><Button type="button" variant="outline" size="sm" onClick={() => void copyDocumentLink()} disabled={!document}><Copy aria-hidden="true" />Copy private link</Button></div>
      <p className="text-[11px] leading-5 text-muted-foreground">Only people who already have access can open the copied link.</p>
      {error && <p className="rounded-lg border border-error/20 bg-error-soft px-3 py-2 text-sm text-error" role="alert">{error.message}</p>}
      {errorMessage && <p className="rounded-lg border border-error/20 bg-error-soft px-3 py-2 text-sm text-error" role="alert">{errorMessage}</p>}
      {loading && <p className="py-8 text-center text-sm text-muted-foreground" role="status">Loading sharing settings…</p>}
      {!loading && !error && <div className="max-h-[360px] overflow-y-auto rounded-xl border border-border">
        {filteredMembers.map((member) => {
          const permission = permissions?.find((item) => item.userId === member.userId)
          const isCreator = member.userId === document?.createdById
          return <div key={member.id} className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0">
            <UserAvatar initials={getInitials(member.user.name)} name={member.user.name} size="sm" tone="slate" />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">{member.user.name}</p><p className="truncate text-xs text-muted-foreground">{member.user.email}</p></div>
            {isCreator ? <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-medium text-primary">Creator</span> : <select aria-label={`Access for ${member.user.name}`} value={permission?.role ?? ''} disabled={savingUserId === member.userId} onChange={(event) => void setPermission(member, event.target.value as DocumentPermissionRole | '')} className="h-8 max-w-[130px] rounded-lg border border-border bg-white px-2 text-xs text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:opacity-50"><option value="">No access</option><option value="VIEWER">Viewer</option><option value="EDITOR">Editor</option></select>}
          </div>
        })}
        {!filteredMembers.length && <div className="px-4 py-10 text-center"><UsersRound aria-hidden="true" className="mx-auto size-5 text-border" /><p className="mt-2 text-sm font-medium text-foreground">No matching members</p><p className="mt-1 text-xs text-muted-foreground">Try a different name or email.</p></div>}
      </div>}
      <div className="flex justify-end"><Button type="button" variant="outline" onClick={onClose}>Done</Button></div>
    </div>
  </Modal>
}
