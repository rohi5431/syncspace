'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CheckSquare2,
  FileCheck2,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users2,
  X,
  Zap,
} from 'lucide-react'
import { Brand } from '@/components/brand/brand'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

export const sidebarNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Recent Documents', href: '/dashboard/recent-documents', icon: FileCheck2 },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban, badge: '4' },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare2, badge: '12' },
  { label: 'Team Members', href: '/dashboard/team', icon: Users2, badge: '8' },
]

export const bottomNavItems = [
  { label: 'Settings', href: '/dashboard/settings', icon: Settings2 },
  { label: 'Help Center', href: '/dashboard/help', icon: HelpCircle },
]

export function AppSidebar({
  mobileOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: {
  mobileOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}) {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState({
    name: 'Rohit Kumar',
    email: 'rohit@northstar.co',
    initials: 'RK',
    tone: 'indigo' as const,
    plan: 'Pro Plan',
  })
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('syncspace_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setCurrentUser({
          name: parsed.name || 'Rohit Kumar',
          email: parsed.email || 'rohit@northstar.co',
          initials: parsed.initials || parsed.name?.slice(0, 2).toUpperCase() || 'RK',
          tone: (parsed.tone || 'indigo') as any,
          plan: 'Pro Plan',
        })
        setIsPlatformAdmin(parsed.platformRole === 'ADMIN')
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

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <aside
      className={`flex h-full flex-col border-r border-[#E9E7F0] bg-white transition-all duration-200 select-none ${
        isCollapsed ? 'w-[78px]' : 'w-[288px]'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-[76px] items-center justify-between px-5 border-b border-[#E9E7F0]">
        {!isCollapsed ? (
          <Brand href="/dashboard" size="lg" />
        ) : (
          <Link href="/dashboard" className="mx-auto flex size-10 items-center justify-center rounded-xl bg-[#6C4CF1] text-white shadow-md">
            <span className="font-extrabold text-lg">S</span>
          </Link>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:grid size-8 place-items-center rounded-lg text-gray-400 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="size-4.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Workspace Switcher */}
      {!isCollapsed ? (
        <div className="pt-3">
          <WorkspaceSwitcher />
        </div>
      ) : (
        <div className="pt-3 flex justify-center">
          <div
            title="Northstar Studio (Pro)"
            className="grid size-11 place-items-center rounded-xl border border-indigo-200 bg-indigo-50 font-bold text-[#6C4CF1] shadow-2xs"
          >
            NS
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav aria-label="Sidebar navigation" className="mt-4 flex-1 overflow-y-auto px-3 scrollbar-thin scrollbar-thumb-gray-200">
        {!isCollapsed && (
          <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Workspace
          </p>
        )}

        <div className="flex flex-col gap-1">
          {sidebarNavItems.map(({ label, href, icon: Icon, badge }) => {
            const active = isItemActive(href)
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                title={isCollapsed ? label : undefined}
                className={`group relative flex items-center rounded-xl font-semibold transition-all ${
                  isCollapsed ? 'size-11 justify-center mx-auto' : 'h-11 px-3.5 text-sm sm:text-[15px]'
                } ${
                  active
                    ? 'bg-[#6C4CF1] text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]'
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`size-5 shrink-0 transition ${
                    active ? 'text-white' : 'text-gray-400 group-hover:text-[#6C4CF1]'
                  }`}
                />

                {!isCollapsed && (
                  <>
                    <span className="ml-3 truncate">{label}</span>
                    {badge && (
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-[#6C4CF1]/10 group-hover:text-[#6C4CF1]'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg group-hover:block z-50">
                    {label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
        {isPlatformAdmin && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                Platform
              </p>
            )}
            <Link
              href="/admin"
              onClick={onClose}
              title={isCollapsed ? 'Platform admin' : undefined}
              className={`group flex items-center rounded-xl font-semibold transition-all ${
                isCollapsed ? 'size-11 justify-center mx-auto' : 'h-10 px-3.5 text-sm'
              } ${
                pathname.startsWith('/admin')
                  ? 'bg-[#6C4CF1] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]'
              }`}
            >
              <ShieldCheck className="size-4.5 shrink-0" />
              {!isCollapsed && <span className="ml-3 truncate">Platform admin</span>}
            </Link>
          </div>
        )}

        {/* Favorites section (matching reference screenshot) */}
        {!isCollapsed ? (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Favorites
            </p>
            <div className="flex flex-col gap-1">
              <Link
                href="/dashboard/documents"
                onClick={onClose}
                className="flex h-9 items-center gap-2 rounded-xl px-3 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
              >
                <span className="size-2 rounded-full bg-[#6C4CF1]" />
                <span className="truncate">Product roadmap</span>
              </Link>
              <Link
                href="/dashboard/documents"
                onClick={onClose}
                className="flex h-9 items-center gap-2 rounded-xl px-3 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
              >
                <span className="size-2 rounded-full bg-[#EC4899]" />
                <span className="truncate">Launch plan</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="my-3 h-px bg-gray-100 mx-2" />
        )}

        {/* Management & Help Section */}
        <div className="mt-5 border-t border-gray-100 pt-4">
          {!isCollapsed && (
            <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Settings & Support
            </p>
          )}
          <div className="flex flex-col gap-1">
            {bottomNavItems.map(({ label, href, icon: Icon }) => {
              const active = isItemActive(href)
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={onClose}
                  title={isCollapsed ? label : undefined}
                  className={`group relative flex items-center rounded-xl font-semibold transition-all ${
                    isCollapsed ? 'size-11 justify-center mx-auto' : 'h-10 px-3.5 text-sm'
                  } ${
                    active
                      ? 'bg-[#6C4CF1] text-white shadow-sm font-bold'
                      : 'text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`size-4.5 shrink-0 transition ${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-[#6C4CF1]'
                    }`}
                  />
                  {!isCollapsed && <span className="ml-3 truncate">{label}</span>}

                  {isCollapsed && (
                    <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg group-hover:block z-50">
                      {label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* User profile & Plan footer */}
      <div className="border-t border-[#E9E7F0] p-3">
        {!isCollapsed ? (
          <div className="rounded-2xl border border-gray-100 bg-[#F7F5FF]/70 p-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C4CF1]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#6C4CF1]">
                <Zap className="size-3" />
                <span>{currentUser.plan}</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">● Active</span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-gray-200/50">
              <div className="flex min-w-0 items-center gap-2.5">
                <UserAvatar initials={currentUser.initials} name={currentUser.name} tone={currentUser.tone} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-gray-950">{currentUser.name}</p>
                  <p className="truncate text-[11px] text-gray-500">{currentUser.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-red-600 transition"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <UserAvatar initials={currentUser.initials} name={currentUser.name} tone={currentUser.tone} size="sm" />
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebarContent}</div>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-950/30 backdrop-blur-xs lg:hidden"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  )
}
