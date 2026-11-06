'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bell, Check, LockKeyhole, Settings2, ShieldCheck, UserRound, Users2 } from 'lucide-react'
import { WorkspaceMembersPanel } from '@/components/dashboard/workspace-members-panel'
import { WorkspaceSettingsDialog } from '@/components/dashboard/workspace-settings-dialog'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import { useWorkspaceContext } from '@/components/dashboard/workspace-provider'
import { getInitials, useAuth } from '@/lib/api-client'
import { formatFullDate } from '@/lib/date-format'

const sections = [
  { id: 'general', label: 'General', icon: Settings2 },
  { id: 'members', label: 'Members', icon: Users2 },
  { id: 'roles', label: 'Roles & permissions', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'account', label: 'Account settings', icon: UserRound },
] as const

type SectionId = (typeof sections)[number]['id']

export function SettingsApp() {
  const { activeWorkspace, isLoading, error } = useWorkspaceContext()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [active, setActive] = useState<SectionId>('general')
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    const requested = searchParams.get('section')
    if (sections.some((section) => section.id === requested)) setActive(requested as SectionId)
  }, [searchParams])

  if (isLoading) return <p className="rounded-2xl border border-border bg-white p-8 text-sm text-muted-foreground" role="status">Loading workspace settings…</p>
  if (error) return <p className="rounded-2xl border border-error/20 bg-white p-5 text-sm text-error" role="alert">{error.message}</p>
  if (!activeWorkspace) return <section className="rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center"><h1 className="text-lg font-semibold text-foreground">No workspace selected</h1><p className="mt-2 text-sm text-muted-foreground">Create or choose a workspace to manage its settings.</p></section>

  const canManage = activeWorkspace.role === 'OWNER' || activeWorkspace.role === 'ADMIN'

  return (
    <section aria-labelledby="settings-title">
      <header className="mb-6 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{activeWorkspace.name}</p>
        <h1 id="settings-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">Workspace settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage workspace details, members, and your account.</p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActive(id)} aria-current={active === id ? 'page' : undefined} className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${active === id ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}`}>
              <Icon aria-hidden="true" className="size-4" />{label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {active === 'general' && <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold text-foreground">General</h2><p className="mt-1 text-xs text-muted-foreground">Workspace details shared with your team.</p></div>
            <dl className="grid gap-5 p-5 sm:grid-cols-2">
              <div><dt className="text-xs text-muted-foreground">Workspace name</dt><dd className="mt-1.5 text-sm font-medium text-foreground">{activeWorkspace.name}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Your role</dt><dd className="mt-1.5 text-sm font-medium text-foreground">{activeWorkspace.role}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Description</dt><dd className="mt-1.5 text-sm leading-6 text-foreground">{activeWorkspace.description || 'No description added.'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Created</dt><dd className="mt-1.5 text-sm text-foreground">{formatFullDate(activeWorkspace.createdAt)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Workspace ID</dt><dd className="mt-1.5 truncate font-mono text-xs text-muted-foreground">{activeWorkspace.id}</dd></div>
            </dl>
            <div className="flex justify-end border-t border-border p-5">
              <Button type="button" onClick={() => setEditOpen(true)} disabled={!canManage} title={canManage ? 'Edit workspace details' : 'Only workspace owners and administrators can edit details'}>Edit workspace</Button>
            </div>
          </section>}

          {active === 'members' && <WorkspaceMembersPanel workspace={activeWorkspace} />}

          {active === 'roles' && <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold text-foreground">Roles & permissions</h2><p className="mt-1 text-xs text-muted-foreground">Access is enforced by the workspace and document APIs.</p></div>
            <div className="divide-y divide-border">
              {[
                { title: 'Owner', description: 'Full workspace control, including member administration and workspace deletion.', items: ['Manage workspace details', 'Add and manage members', 'Manage all workspace documents'] },
                { title: 'Admin', description: 'Manage workspace members and shared content without transferring ownership.', items: ['Manage workspace details', 'Add and manage members', 'Manage workspace documents'] },
                { title: 'Member', description: 'Collaborate within the workspace and access documents according to their permissions.', items: ['Create and organize documents', 'Edit documents shared with them', 'View workspace activity'] },
              ].map((role) => <article key={role.title} className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div><h3 className="text-sm font-semibold text-foreground">{role.title}</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{role.description}</p></div>
                <ul className="flex flex-col gap-2">{role.items.map((item) => <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground"><Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-success" />{item}</li>)}</ul>
              </article>)}
            </div>
          </section>}

          {active === 'notifications' && <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning"><Bell aria-hidden="true" className="size-4" /></span><div><h2 className="text-sm font-semibold text-foreground">Notification preferences</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">There is no notification-preferences service connected to this workspace yet, so preferences are not shown or saved here.</p></div></div>
          </section>}

          {active === 'account' && <div className="flex flex-col gap-4">
            <section className="rounded-2xl border border-border bg-white shadow-sm">
              <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold text-foreground">Account settings</h2><p className="mt-1 text-xs text-muted-foreground">Your authenticated SyncSpace profile.</p></div>
              <div className="flex flex-wrap items-center gap-4 p-5">
                <UserAvatar initials={getInitials(user?.name ?? 'User')} name={user?.name ?? 'User'} tone="slate" size="lg" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{user?.name ?? 'Loading profile'}</p><p className="mt-1 truncate text-xs text-muted-foreground">{user?.email ?? ' '}</p></div>
              </div>
              <div className="flex items-start gap-3 border-t border-border p-5"><LockKeyhole aria-hidden="true" className="mt-0.5 size-4 text-primary" /><div><p className="text-sm font-medium text-foreground">Sign-in security</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Your account uses the workspace&apos;s authenticated session. Password changes are managed through the sign-in flow.</p></div></div>
            </section>
          </div>}
        </div>
      </div>
      <WorkspaceSettingsDialog key={activeWorkspace.id} workspace={activeWorkspace} open={editOpen} onClose={() => setEditOpen(false)} />
    </section>
  )
}
