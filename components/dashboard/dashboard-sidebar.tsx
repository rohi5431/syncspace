'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BarChart3,
  Calendar,
  CheckSquare2,
  ChevronDown,
  ChevronRight,
  Database,
  FileCheck2,
  FileText,
  FolderKanban,
  HelpCircle,
  Kanban,
  LayoutDashboard,
  Layers,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Share2,
  ShieldCheck,
  Star,
  Users2,
  X,
  Zap,
} from 'lucide-react'
import { Brand } from '@/components/brand/brand'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { WorkspaceSwitcher } from '@/components/dashboard/workspace-switcher'

interface NavItem {
  label: string
  href: string
  icon: any
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'WORKSPACE',
    items: [
      { label: 'Overview', href: '/dashboard#overview', icon: LayoutDashboard },
      { label: 'My Documents', href: '/dashboard#documents', icon: FileText },
      { label: 'Shared with Me', href: '/dashboard#shared-documents', icon: Share2 },
      { label: 'Recent Documents', href: '/dashboard#recent-documents', icon: FileCheck2 },
      { label: 'Starred Documents', href: '/dashboard#starred-documents', icon: Star },
    ],
  },
  {
    title: 'PROJECT MANAGEMENT',
    items: [
      { label: 'Projects', href: '/dashboard#projects', icon: FolderKanban, badge: '4' },
      { label: 'My Tasks', href: '/dashboard#tasks', icon: CheckSquare2, badge: '12' },
      { label: 'Kanban Boards', href: '/dashboard#kanban', icon: Kanban },
      { label: 'Calendar', href: '/dashboard#calendar-deadlines', icon: Calendar },
    ],
  },
  {
    title: 'COLLABORATION',
    items: [
      { label: 'Team Members', href: '/dashboard#team', icon: Users2, badge: '8' },
      { label: 'Messages', href: '/dashboard#messages', icon: MessageSquare },
      { label: 'Activity Feed', href: '/dashboard#activity-feed', icon: Activity },
      { label: 'Notifications', href: '/dashboard#notifications', icon: Zap },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Analytics', href: '/dashboard#analytics', icon: BarChart3 },
      { label: 'Integrations', href: '/dashboard#integrations', icon: Layers },
      { label: 'Audit Logs', href: '/dashboard#audit-logs', icon: ShieldCheck },
    ],
  },
  {
    title: 'PERSONAL',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Help & Support', href: '/dashboard#help', icon: HelpCircle },
    ],
  },
]

export function DashboardSidebar({
  mobileOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  activeHash = '#overview',
  onSelectNav,
}: {
  mobileOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  activeHash?: string
  onSelectNav?: (hash: string) => void
}) {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState({
    name: 'Rohit Kumar',
    email: 'rohit@northstar.co',
    initials: 'RK',
    tone: 'indigo' as const,
    plan: 'Pro Plan',
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
          tone: (parsed.tone || 'indigo') as any,
          plan: 'Pro Plan',
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

  const handleItemClick = (href: string) => {
    if (href.includes('#')) {
      const hash = href.substring(href.indexOf('#'))
      onSelectNav?.(hash)
    }
    onClose()
  }

  const sidebarContent = (
    <aside
      className={`flex h-full flex-col border-r border-[#E9E7F0] bg-white transition-all duration-200 select-none ${
        isCollapsed ? 'w-[78px]' : 'w-[288px]'
      }`}
    >
      {/* 1. BRAND HEADER */}
      <div className="flex h-[76px] items-center justify-between px-4 sm:px-5 border-b border-[#E9E7F0]">
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

      {/* 2. WORKSPACE SWITCHER */}
      {!isCollapsed ? (
        <div className="px-3 pt-3">
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

      {/* 3. NAVIGATION SECTIONS */}
      <nav
        aria-label="Sidebar Navigation"
        className="mt-4 flex-1 overflow-y-auto px-3 scrollbar-thin scrollbar-thumb-gray-200"
      >
        <div className="flex flex-col gap-5 pb-6">
          {navSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed ? (
                <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  {section.title}
                </p>
              ) : (
                <div className="my-2 h-px bg-gray-100 mx-2" />
              )}

              <div className="flex flex-col gap-1">
                {section.items.map(({ label, href, icon: Icon, badge }) => {
                  const targetHash = href.includes('#') ? href.substring(href.indexOf('#')) : ''
                  const isItemActive =
                    href === pathname ||
                    (pathname === '/dashboard' && targetHash === activeHash) ||
                    (targetHash === '#overview' && activeHash === '#overview')

                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => handleItemClick(href)}
                      title={isCollapsed ? label : undefined}
                      className={`group relative flex items-center rounded-xl font-semibold transition-all ${
                        isCollapsed
                          ? 'size-11 justify-center mx-auto'
                          : 'h-10.5 px-3 text-sm'
                      } ${
                        isItemActive
                          ? 'bg-[#6C4CF1] text-white shadow-sm font-bold'
                          : 'text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]'
                      }`}
                    >
                      <Icon
                        aria-hidden="true"
                        className={`size-4.5 shrink-0 transition ${
                          isItemActive ? 'text-white' : 'text-gray-400 group-hover:text-[#6C4CF1]'
                        }`}
                      />

                      {!isCollapsed && (
                        <>
                          <span className="ml-3 truncate">{label}</span>
                          {badge && (
                            <span
                              className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                isItemActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gray-100 text-gray-600 group-hover:bg-[#6C4CF1]/10 group-hover:text-[#6C4CF1]'
                              }`}
                            >
                              {badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Tooltip in collapsed rail */}
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
          ))}
        </div>
      </nav>

      {/* 4. BOTTOM USER PROFILE & PLAN INDICATOR */}
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

              <div className="flex items-center gap-1">
                <Link
                  href="/settings"
                  title="Account settings"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-900 transition"
                >
                  <Settings className="size-4" />
                </Link>
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
      {/* Desktop Sticky/Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebarContent}</div>

      {/* Mobile Drawer */}
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
