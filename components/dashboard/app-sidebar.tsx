'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { mutate } from 'swr'
import { BarChart3, CheckSquare2, FileText, FolderKanban, HelpCircle, LayoutDashboard, LogOut, Settings2, Users2, X } from 'lucide-react'
import { Brand } from '@/components/brand/brand'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { WorkspaceSwitcher } from '@/components/dashboard/workspace-switcher'
import { apiRequest, AUTH_USER_KEY, getInitials, useAuth, WORKSPACES_KEY } from '@/lib/api-client'
import { useToast } from '@/components/providers/toast-provider'

const mainNav = [
  { label: 'Dashboard', href: '/dashboard#overview', icon: LayoutDashboard },
  { label: 'My documents', href: '/dashboard#documents', icon: FileText },
  { label: 'Recent documents', href: '/dashboard#recent-documents', icon: BarChart3 },
  { label: 'Projects', href: '/dashboard#projects', icon: FolderKanban },
  { label: 'Tasks', href: '/dashboard#tasks', icon: CheckSquare2 },
  { label: 'Team members', href: '/dashboard#team', icon: Users2 },
]

export function AppSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()
  const [profileOpen, setProfileOpen] = useState(false)
  const displayName = user?.name ?? 'Account'
  const sidebar = (
    <aside className="flex h-full w-[264px] flex-col border-r border-gray-200 bg-white">
      <div className="flex h-[68px] items-center justify-between px-5"><Brand href="/dashboard" /><button type="button" onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden" aria-label="Close navigation"><X className="size-4" /></button></div>
      <WorkspaceSwitcher />
      <nav aria-label="Workspace navigation" className="mt-7 flex-1 px-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Workspace</p>
        <div className="flex flex-col gap-1">{mainNav.map(({ label, href, icon: Icon }) => {
          const active = pathname === '/dashboard' && label === 'Dashboard'
          return <Link key={label} href={href} onClick={onClose} aria-current={active ? 'page' : undefined} className={`flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] transition ${active ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><Icon aria-hidden="true" className="size-[16px]" />{label}</Link>
        })}</div>
        <div className="mt-8 border-t border-gray-100 pt-5"><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Manage</p><Link href="/settings" onClick={onClose} aria-current={pathname === '/settings' ? 'page' : undefined} className={`flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] transition ${pathname === '/settings' ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><Settings2 aria-hidden="true" className="size-[16px]" /> Settings</Link><button type="button" onClick={() => window.dispatchEvent(new CustomEvent('syncspace:help'))} className="mt-1 flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"><HelpCircle aria-hidden="true" className="size-[16px]" /> Help center</button></div>
      </nav>
      <div className="m-3 rounded-xl border border-gray-200 p-3"><p className="text-xs font-semibold text-gray-800">Keep your team in sync</p><p className="mt-1 text-[11px] leading-5 text-gray-500">Invite a teammate to your workspace.</p><Link href="/dashboard#team" onClick={onClose} className="mt-2 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700">View your team</Link></div>
      <div className="relative border-t border-gray-100 p-3"><button type="button" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen} aria-label={`${displayName} account menu`} className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition hover:bg-gray-50"><UserAvatar initials={getInitials(displayName)} name={displayName} tone="slate" size="sm" /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-gray-800">{displayName}</span><span className="block truncate text-[10px] text-gray-500">{user?.email ?? 'Loading profile'}</span></span><span aria-hidden="true" className="text-gray-400">···</span></button>{profileOpen && <div className="absolute right-3 bottom-full left-3 mb-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"><button type="button" onClick={async () => { try { await apiRequest<void>('/auth/logout', { method: 'POST' }) } catch { toast('Unable to sign out right now. Please try again.'); return } await mutate(AUTH_USER_KEY, null, { revalidate: false }); await mutate(WORKSPACES_KEY, null, { revalidate: false }); setProfileOpen(false); onClose(); router.replace('/login'); router.refresh() }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-50"><LogOut aria-hidden="true" className="size-4" />Sign out</button></div>}</div>
    </aside>
  )

  return <><div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>{mobileOpen && <div className="fixed inset-0 z-40 bg-gray-950/20 lg:hidden" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="h-full">{sidebar}</div></div>}</>
}
