'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  CheckSquare2,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings2,
  Users2,
  X,
} from 'lucide-react'
import { Brand } from '@/components/brand/brand'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { WorkspaceSwitcher } from '@/components/dashboard/workspace-switcher'

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
  const [currentUser, setCurrentUser] = useState({
    name: 'Rohit Kumar',
    email: 'rohit@northstar.co',
    initials: 'RK',
    tone: 'slate' as const,
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem('syncspace_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setCurrentUser({
          name: parsed.name || 'Rohit Kumar',
          email: parsed.email || 'rohit@northstar.co',
          initials: parsed.initials || parsed.name?.slice(0, 2).toUpperCase() || 'RK',
          tone: (parsed.tone || 'slate') as any,
        })
      }
    } catch {
      // fallback
    }
  }, [])

  const handleLogout = () => {
    try {
      localStorage.removeItem('syncspace_token')
      localStorage.removeItem('syncspace_user')
      localStorage.removeItem('syncspace_workspace')
      document.cookie = 'syncspace_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    } finally {
      window.location.href = '/login'
    }
  }

  const sidebar = (
    <aside className="flex h-full w-[288px] flex-col border-r border-gray-200 bg-white shadow-xs">
      {/* Brand Header */}
      <div className="flex h-[76px] items-center justify-between px-6 border-b border-gray-100">
        <Brand href="/dashboard" size="lg" />
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-4">
        <WorkspaceSwitcher />
      </div>

      {/* Main Navigation Links */}
      <nav aria-label="Workspace navigation" className="mt-6 flex-1 px-4 overflow-y-auto">
        <p className="mb-2.5 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Workspace</p>
        <div className="flex flex-col gap-1.5">
          {mainNav.map(({ label, href, icon: Icon }) => {
            const active = pathname === '/dashboard' && label === 'Dashboard'
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={`flex h-11 items-center gap-3.5 rounded-xl px-3.5 text-sm sm:text-[15px] font-semibold transition ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                }`}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Manage Section */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="mb-2.5 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">Manage</p>
          <div className="flex flex-col gap-1.5">
            <Link
              href="/settings"
              onClick={onClose}
              aria-current={pathname === '/settings' ? 'page' : undefined}
              className={`flex h-11 items-center gap-3.5 rounded-xl px-3.5 text-sm sm:text-[15px] font-semibold transition ${
                pathname === '/settings'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
              }`}
            >
              <Settings2 aria-hidden="true" className="size-5 shrink-0" />
              <span>Settings</span>
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('syncspace:help'))}
              className="flex h-11 w-full items-center gap-3.5 rounded-xl px-3.5 text-left text-sm sm:text-[15px] font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
            >
              <HelpCircle aria-hidden="true" className="size-5 shrink-0" />
              <span>Help center</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sync Card */}
      <div className="m-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
        <p className="text-sm font-bold text-gray-900">Keep your team in sync</p>
        <p className="mt-1 text-xs leading-5 text-gray-600 font-medium">Invite teammates to collaborate in real-time.</p>
        <Link
          href="/dashboard#team"
          onClick={onClose}
          className="mt-2.5 inline-flex text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          View team members →
        </Link>
      </div>

      {/* User Section with Logout */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar initials={currentUser.initials} name={currentUser.name} tone={currentUser.tone} size="md" />
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-gray-900">{currentUser.name}</span>
              <span className="block truncate text-xs text-gray-500 font-medium">{currentUser.email}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition"
            aria-label="Sign out"
          >
            <LogOut className="size-4.5" />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-950/30 backdrop-blur-xs lg:hidden"
          onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
          <div className="h-full">{sidebar}</div>
        </div>
      )}
    </>
  )
}
