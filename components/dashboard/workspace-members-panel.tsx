'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useSWRConfig } from 'swr'
import type { PaginatedResult, WorkspaceMemberSummary, WorkspaceSummary } from '@syncspace/contracts'
import { MoreHorizontal, Plus, UserRound } from 'lucide-react'
import { useToast } from '@/components/providers/toast-provider'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ConfirmActionDialog } from '@/components/documents/document-dialogs'
import { Modal } from '@/components/ui/modal'
import { ApiError, apiFetcher, apiRequest, getInitials } from '@/lib/api-client'
import { refreshWorkspaceData } from '@/lib/workspace-data'

export function WorkspaceMembersPanel({ workspace }: { workspace: WorkspaceSummary }) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMemberSummary | null>(null)
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const canManage = workspace.role === 'OWNER' || workspace.role === 'ADMIN'
  const key = `/api/workspaces/${workspace.id}/members?page=1&pageSize=100`
  const { data, error, isLoading, mutate } = useSWR<PaginatedResult<WorkspaceMemberSummary>, ApiError>(key, apiFetcher)
  const { mutate: mutateGlobal } = useSWRConfig()
  const toast = useToast()

  const addMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return
    setSubmitting(true)
    setFormError('')
    try {
      await apiRequest(`/workspaces/${workspace.id}/members`, { method: 'POST', body: { email: normalizedEmail } })
      await mutate()
      await refreshWorkspaceData(workspace.id)
      await mutateGlobal((cacheKey) => typeof cacheKey === 'string' && cacheKey.startsWith('/api/workspaces/'), undefined, { revalidate: true })
      setEmail('')
      setInviteOpen(false)
      toast(`Added ${normalizedEmail} to ${workspace.name}.`)
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : 'Could not add that member. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const changeRole = async (member: WorkspaceMemberSummary, role: 'ADMIN' | 'MEMBER') => {
    try {
      await apiRequest(`/workspaces/${workspace.id}/members/${member.id}`, { method: 'PATCH', body: { role } })
      await mutate()
      await refreshWorkspaceData(workspace.id)
      toast(`${member.user.name} is now ${role.toLowerCase()}.`)
    } catch (cause) {
      toast(cause instanceof ApiError ? cause.message : 'Could not change the member role.')
    }
  }

  const removeMember = async () => {
    if (!memberToRemove) return
    await apiRequest<void>(`/workspaces/${workspace.id}/members/${memberToRemove.id}`, { method: 'DELETE' })
    await mutate()
    await refreshWorkspaceData(workspace.id)
    toast(`Removed ${memberToRemove.user.name} from the workspace.`)
    setMemberToRemove(null)
  }

  return <section aria-labelledby="workspace-members-title" className="rounded-2xl border border-border bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div><h2 id="workspace-members-title" className="text-base font-semibold tracking-tight text-foreground">Workspace members</h2><p className="mt-1 text-xs text-muted-foreground">{data?.total ?? 0} people with workspace access</p></div>
      {canManage && <Button type="button" variant="outline" size="sm" onClick={() => setInviteOpen(true)}><Plus data-icon="inline-start" />Add member</Button>}
    </div>
    {isLoading && <p className="mt-5 text-sm text-muted-foreground" role="status">Loading members…</p>}
    {error && <p className="mt-5 rounded-lg border border-error/20 bg-white px-3 py-2 text-sm text-error" role="alert">{error.message}</p>}
    {!isLoading && !error && <ul className="mt-4 divide-y divide-border">
      {(data?.items ?? []).map((member) => {
        const canChange = workspace.role === 'OWNER' && member.role !== 'OWNER'
        const canRemove = member.role !== 'OWNER' && (workspace.role === 'OWNER' || (workspace.role === 'ADMIN' && member.role === 'MEMBER'))
        return <li key={member.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
          <UserAvatar initials={getInitials(member.user.name)} name={member.user.name} size="sm" tone="slate" />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">{member.user.name}</p><p className="truncate text-xs text-muted-foreground">{member.user.email}</p></div>
          {canChange ? <select aria-label={`Role for ${member.user.name}`} value={member.role} onChange={(event) => void changeRole(member, event.target.value as 'ADMIN' | 'MEMBER')} className="h-8 rounded-lg border border-border bg-white px-2 text-xs text-muted-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="ADMIN">Admin</option><option value="MEMBER">Member</option></select> : <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{member.role}</span>}
          {canRemove && <button type="button" onClick={() => setMemberToRemove(member)} className="rounded-lg p-2 text-muted-foreground transition hover:bg-surface-muted hover:text-error" aria-label={`Remove ${member.user.name}`}><MoreHorizontal aria-hidden="true" className="size-4" /></button>}
        </li>
      })}
      {!data?.items.length && <li className="py-8 text-center text-sm text-muted-foreground"><UserRound aria-hidden="true" className="mx-auto mb-2 size-5 text-border" />No workspace members yet.</li>}
    </ul>}
    <ConfirmActionDialog
      open={Boolean(memberToRemove)}
      title="Remove workspace member?"
      description={`Remove ${memberToRemove?.user.name ?? 'this member'} from ${workspace.name}? They will lose access to this workspace and its documents.`}
      confirmLabel="Remove member"
      onClose={() => setMemberToRemove(null)}
      onConfirm={removeMember}
    />
    <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Add a workspace member" description="Add an existing SyncSpace account to this workspace.">
      <form onSubmit={addMember} className="flex flex-col gap-5">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="member-email">Email address</FieldLabel>
            <Input
              id="member-email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(event) => { setEmail(event.currentTarget.value); setFormError('') }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
              }}
              aria-invalid={Boolean(formError)}
              aria-describedby={formError ? 'member-error' : undefined}
              placeholder="teammate@example.com"
            />
            <FieldDescription>The account must already exist. Email invitations are not enabled yet.</FieldDescription>
            {formError && <p id="member-error" className="text-xs text-error" role="alert">{formError}</p>}
          </Field>
        </FieldGroup>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setInviteOpen(false)} disabled={submitting}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add member'}</Button></div>
      </form>
    </Modal>
  </section>
}
