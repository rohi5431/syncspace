'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import type { PaginatedResult, WorkspaceMemberSummary } from '@syncspace/contracts'
import { Activity, CalendarDays, CheckSquare2, Clock3, FileText, FolderKanban, Heart, LayoutDashboard, LogOut, Mail, PanelLeftClose, PanelLeftOpen, Settings2, Users2, UserRound, Cable, X } from 'lucide-react'
import { Brand } from '@/components/brand/brand'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { WorkspaceSwitcher } from '@/components/dashboard/workspace-switcher'
import { apiFetcher, apiRequest, ApiError, AUTH_USER_KEY, getInitials, useAuth, WORKSPACES_KEY } from '@/lib/api-client'
import { useWorkspaceContext } from '@/components/dashboard/workspace-provider'
import { useToast } from '@/components/providers/toast-provider'

type SidebarItem = {
  label: string
  href?: string
  icon: typeof LayoutDashboard
  view?: 'all' | 'shared' | 'recent' | 'favorites'
  disabled?: boolean
}

const navigationGroups: { label: string; items: SidebarItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My documents', href: '/dashboard/documents', icon: FileText, view: 'all' },
      { label: 'Shared with me', href: '/dashboard/documents?view=shared', icon: Users2, view: 'shared' },
      { label: 'Recent documents', href: '/dashboard/documents?view=recent', icon: Clock3, view: 'recent' },
      { label: 'Favorites', href: '/dashboard/documents?view=favorites', icon: Heart, view: 'favorites' },
    ],
  },
  {
    label: 'Project management',
    items: [
      { label: 'Projects', icon: FolderKanban, disabled: true },
      { label: 'Tasks', icon: CheckSquare2, disabled: true },
      { label: 'Calendar', icon: CalendarDays, disabled: true },
      { label: 'Activity', href: '/dashboard#activity', icon: Activity },
    ],
  },
  {
    label: 'Team',
    items: [
      { label: 'Members', href: '/dashboard#team', icon: Users2 },
      { label: 'Invitations', icon: Mail, disabled: true },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Workspace settings', href: '/settings', icon: Settings2 },
      { label: 'Account settings', href: '/settings?section=account', icon: UserRound },
      { label: 'Integrations', icon: Cable, disabled: true },
    ],
  },
]

export function AppSidebar({
  mobileOpen,
  onClose,
  collapsed = false,
  onToggleCollapsed,
}: {
  mobileOpen: boolean
  onClose: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { activeWorkspace } = useWorkspaceContext()
  const toast = useToast()
  const [profileOpen, setProfileOpen] = useState(false)
  const displayName = user?.name ?? 'Account'
  const isCollapsed = collapsed && !mobileOpen
  const membersKey = activeWorkspace ? `/api/workspaces/${activeWorkspace.id}/members?page=1&pageSize=4` : null
  const { data: members } = useSWR<PaginatedResult<WorkspaceMemberSummary>, ApiError>(membersKey, apiFetcher)
  const currentView = searchParams.get('view') ?? 'all'

  const sidebar = (
    <aside className={`flex h-full flex-col rounded-[24px] border border-border bg-white shadow-[0_18px_50px_-32px_rgba(48,43,92,0.35)] ${mobileOpen ? 'w-[min(84vw,300px)]' : isCollapsed ? 'w-[76px]' : 'w-[254px]'}`}>
      <div className={`flex h-[68px] shrink-0 items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <Brand href="/dashboard" compact={isCollapsed} />
        {!isCollapsed && <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted lg:hidden" aria-label="Close navigation"><X aria-hidden="true" className="size-4" /></button>}
        {!mobileOpen && onToggleCollapsed && <button type="button" onClick={onToggleCollapsed} className="hidden rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted lg:inline-flex" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{isCollapsed ? <PanelLeftOpen aria-hidden="true" className="size-4" /> : <PanelLeftClose aria-hidden="true" className="size-4" />}</button>}
      </div>
      <WorkspaceSwitcher collapsed={isCollapsed} />
      <nav aria-label="Workspace navigation" className="mt-5 min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-5">
            {!isCollapsed && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{group.label}</p>}
            <div className="flex flex-col gap-1">
              {group.items.map(({ label, href, icon: Icon, view, disabled }) => {
                const documentsRoute = Boolean(view && pathname.startsWith('/dashboard/documents'))
                const active = view
                  ? documentsRoute && currentView === view
                  : href === '/dashboard'
                    ? pathname === '/dashboard'
                    : href?.startsWith('/settings')
                      ? pathname === '/settings' && (href.includes('section=account') ? searchParams.get('section') === 'account' : searchParams.get('section') !== 'account')
                      : false
                const classes = `flex h-9 items-center rounded-xl text-[12px] transition ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${active ? 'bg-accent font-semibold text-primary' : disabled ? 'cursor-not-allowed text-muted-foreground/60' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}`
                if (disabled) {
                  return <span key={label} aria-disabled="true" title={`${label} is not available in this workspace yet`} className={classes}><Icon aria-hidden="true" className="size-4 shrink-0" />{!isCollapsed && <><span className="min-w-0 flex-1 truncate">{label}</span><span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[9px]">Soon</span></>}</span>
                }
                return <Link key={label} href={href ?? '/dashboard'} onClick={onClose} aria-current={active ? 'page' : undefined} title={isCollapsed ? label : undefined} className={classes}><Icon aria-hidden="true" className="size-4 shrink-0" />{!isCollapsed && <span className="truncate">{label}</span>}</Link>
              })}
            </div>
          </div>
        ))}

        {!isCollapsed && members?.items.length ? (
          <div className="border-t border-border pt-4">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Recent members</p>
            <div className="flex flex-col gap-2 px-2">
              {members.items.slice(0, 4).map((member) => (
                <div key={member.id} className="flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-1">
                  <UserAvatar initials={getInitials(member.user.name)} name={member.user.name} size="sm" tone="slate" />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-foreground">{member.user.name}</span>
                  <span className="text-[9px] text-muted-foreground">{member.role.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </nav>

      {!isCollapsed && <div className="mx-3 mb-3 rounded-2xl border border-border bg-accent/60 p-3">
        <p className="text-xs font-semibold text-foreground">Keep your team in sync</p>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">Share documents with workspace members and stay close to the latest work.</p>
        <Link href="/dashboard#team" onClick={onClose} className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">View your team</Link>
      </div>}

      <div className={`relative shrink-0 border-t border-border p-2.5 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button type="button" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen} aria-label={`${displayName} account menu`} title={isCollapsed ? displayName : undefined} className={`flex w-full items-center rounded-xl p-2 text-left transition hover:bg-surface-muted ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
          <UserAvatar initials={getInitials(displayName)} name={displayName} tone="slate" size="sm" />
          {!isCollapsed && <><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-foreground">{displayName}</span><span className="block truncate text-[10px] text-muted-foreground">{user?.email ?? 'Loading profile'}</span></span><span aria-hidden="true" className="text-muted-foreground">···</span></>}
        </button>
        {profileOpen && <div className={`absolute bottom-full z-30 mb-2 rounded-xl border border-border bg-white p-1.5 shadow-lg ${isCollapsed ? 'left-full ml-2 w-52' : 'right-3 left-3'}`}>
          <Link href="/settings?section=account" onClick={() => { setProfileOpen(false); onClose() }} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition hover:bg-surface-muted"><UserRound aria-hidden="true" className="size-4" />Account settings</Link>
          <button type="button" onClick={async () => { try { await apiRequest<void>('/auth/logout', { method: 'POST' }) } catch { toast('Unable to sign out right now. Please try again.'); return } await mutate(AUTH_USER_KEY, null, { revalidate: false }); await mutate(WORKSPACES_KEY, null, { revalidate: false }); setProfileOpen(false); onClose(); router.replace('/login'); router.refresh() }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground transition hover:bg-surface-muted"><LogOut aria-hidden="true" className="size-4" />Sign out</button>
        </div>}
      </div>
    </aside>
  )

  return (
    <>
      <div className="fixed inset-y-3 left-3 z-30 hidden lg:block">{sidebar}</div>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-foreground/20 p-3 backdrop-blur-[2px] lg:hidden">
        <button type="button" aria-label="Close navigation" className="absolute inset-0 size-full cursor-default" onClick={onClose} />
        <div className="relative z-10 h-full">{sidebar}</div>
      </div>}
    </>
  )
}
