'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Command,
  FileText,
  FolderKanban,
  HelpCircle,
  Keyboard,
  LogOut,
  Mail,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
  Users2,
  X,
  Zap,
} from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import type { DocumentSummary, ProjectSummary, TaskSummary } from './dashboard-types'

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  category: 'document' | 'task' | 'team' | 'security'
  read: boolean
  targetHref: string
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Document shared with you',
    message: 'Maya Chen shared "Product roadmap — Q4 2026" with edit permissions.',
    time: '12m ago',
    category: 'document',
    read: false,
    targetHref: '/dashboard#recent-documents',
  },
  {
    id: 'n2',
    title: 'Task assigned',
    message: 'Jordan Lee assigned you "Audit Redis pub/sub queue latency" with high priority.',
    time: '45m ago',
    category: 'task',
    read: false,
    targetHref: '/dashboard#tasks',
  },
  {
    id: 'n3',
    title: 'Workspace invitation accepted',
    message: 'Aisha Shah joined Northstar Studio as Product Manager.',
    time: '2h ago',
    category: 'team',
    read: true,
    targetHref: '/dashboard#team',
  },
  {
    id: 'n4',
    title: 'Milestone reached',
    message: 'Website refresh project reached 65% completion.',
    time: '5h ago',
    category: 'task',
    read: true,
    targetHref: '/dashboard#projects',
  },
]

export function DashboardHeader({
  onMenuClick,
  documents = [],
  projects = [],
  tasks = [],
  workspaceName = 'Northstar Studio',
  onCreateDocument,
  onCreateProject,
  onCreateTask,
  onCreateWorkspace,
  onInviteMember,
}: {
  onMenuClick: () => void
  documents?: DocumentSummary[]
  projects?: ProjectSummary[]
  tasks?: TaskSummary[]
  workspaceName?: string
  onCreateDocument: () => void
  onCreateProject: () => void
  onCreateTask: () => void
  onCreateWorkspace: () => void
  onInviteMember: () => void
}) {
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all')

  const createMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const [currentUser, setCurrentUser] = useState({
    name: 'Rohit Kumar',
    email: 'rohit@northstar.co',
    initials: 'RK',
    tone: 'indigo' as const,
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
        })
      }
    } catch {
      // fallback
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast('All notifications marked as read.')
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

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

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#E9E7F0] bg-white/95 px-4 backdrop-blur sm:px-8 lg:px-10 xl:px-12">
      {/* LEFT: BREADCRUMBS & TITLE */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid size-10 place-items-center rounded-xl text-gray-500 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="size-6" />
        </button>

        <div className="hidden sm:flex flex-col">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <span>Workspace</span>
            <ChevronRight className="size-3 text-gray-300" />
            <span className="text-gray-600 font-bold">{workspaceName}</span>
            <ChevronRight className="size-3 text-gray-300" />
            <span className="text-[#6C4CF1] font-bold">Dashboard</span>
          </nav>
          <h1 className="text-base lg:text-lg font-extrabold text-[#1F2937]">Dashboard Overview</h1>
        </div>
      </div>

      {/* CENTER: GLOBAL SEARCH */}
      <div className="flex-1 max-w-md mx-4">
        <GlobalSearch documents={documents} projects={projects} tasks={tasks} />
      </div>

      {/* RIGHT: CREATE NEW + NOTIFICATIONS + USER DROPDOWN */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Realtime Status Indicator */}
        <div className="hidden 2xl:inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Realtime 24ms</span>
        </div>

        {/* 1. CREATE NEW DROPDOWN */}
        <div className="relative" ref={createMenuRef}>
          <Button
            type="button"
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="h-10 sm:h-11 rounded-xl bg-[#6C4CF1] px-3.5 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#5738D6] gap-1.5 sm:gap-2"
          >
            <Plus className="size-4" />
            <span className="hidden md:inline">Create New</span>
            <ChevronDown className="size-3.5 text-white/80" />
          </Button>

          {createMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E9E7F0] bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
              <p className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                Quick Actions
              </p>
              <button
                type="button"
                onClick={() => {
                  setCreateMenuOpen(false)
                  onCreateDocument()
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
              >
                <FileText className="size-4 text-[#6C4CF1]" />
                <span>New Document</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateMenuOpen(false)
                  onCreateProject()
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
              >
                <FolderKanban className="size-4 text-[#EC4899]" />
                <span>New Project</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateMenuOpen(false)
                  onCreateTask()
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
              >
                <Check className="size-4 text-[#16A34A]" />
                <span>New Task</span>
              </button>
              <div className="my-1 h-px bg-gray-100" />
              <button
                type="button"
                onClick={() => {
                  setCreateMenuOpen(false)
                  onInviteMember()
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
              >
                <Users2 className="size-4 text-[#3B82F6]" />
                <span>Invite Team Member</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateMenuOpen(false)
                  onCreateWorkspace()
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
              >
                <Sparkles className="size-4 text-[#F59E0B]" />
                <span>New Workspace</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. NOTIFICATIONS ICON & POPOVER */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative grid size-10 sm:size-11 place-items-center rounded-xl border border-gray-200 text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-[#EC4899] text-[10px] font-extrabold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E9E7F0] bg-white p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-gray-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#EC4899]/10 px-2 py-0.5 text-[10px] font-bold text-[#EC4899]">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-[#6C4CF1] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => setNotifFilter('all')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    notifFilter === 'all'
                      ? 'bg-[#6C4CF1] text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter('unread')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    notifFilter === 'unread'
                      ? 'bg-[#6C4CF1] text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* List */}
              <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications
                  .filter((n) => (notifFilter === 'unread' ? !n.read : true))
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className={`group relative p-2.5 rounded-xl transition cursor-pointer ${
                        item.read ? 'hover:bg-gray-50' : 'bg-[#F7F5FF]/60 hover:bg-[#F7F5FF]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-gray-900">{item.title}</p>
                        <span className="text-[10px] font-medium text-gray-400 shrink-0">{item.time}</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2 leading-relaxed">{item.message}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <Link
                          href={item.targetHref}
                          onClick={() => setNotificationOpen(false)}
                          className="text-[11px] font-bold text-[#6C4CF1] hover:underline flex items-center gap-1"
                        >
                          <span>View item</span>
                          <ChevronRight className="size-3" />
                        </Link>
                        {!item.read && (
                          <span className="size-2 rounded-full bg-[#EC4899]" title="Unread" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. HELP ICON */}
        <button
          type="button"
          onClick={() => toast('SyncSpace Help: Documentation, WebSocket status, and Guides are active.')}
          className="hidden sm:grid size-10 sm:size-11 place-items-center rounded-xl border border-gray-200 text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
          aria-label="Help & Documentation"
        >
          <HelpCircle className="size-5" />
        </button>

        <div className="hidden sm:block h-7 w-px bg-gray-200 mx-1" />

        {/* 4. USER PROFILE DROPDOWN */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-[#F7F5FF] transition"
            aria-label="User profile menu"
          >
            <UserAvatar initials={currentUser.initials} name={currentUser.name} tone={currentUser.tone} size="md" />
            <ChevronDown className="hidden sm:block size-4 text-gray-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E9E7F0] bg-white p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 p-2 border-b border-gray-100 pb-3">
                <UserAvatar initials={currentUser.initials} name={currentUser.name} tone={currentUser.tone} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{currentUser.name}</p>
                  <p className="truncate text-xs text-gray-500">{currentUser.email}</p>
                </div>
              </div>

              <div className="py-2 flex flex-col gap-1">
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
                >
                  <User className="size-4 text-gray-400" />
                  <span>Account Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
                >
                  <Settings className="size-4 text-gray-400" />
                  <span>Workspace Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false)
                    toast('Keyboard shortcuts: Ctrl+K (Search), Ctrl+N (New Doc), Esc (Close modal)')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
                >
                  <Keyboard className="size-4 text-gray-400" />
                  <span>Keyboard Shortcuts</span>
                </button>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// GLOBAL SEARCH COMPONENT WITH SHORTCUT (Ctrl + K)
function GlobalSearch({
  documents = [],
  projects = [],
  tasks = [],
}: {
  documents: DocumentSummary[]
  projects: ProjectSummary[]
  tasks: TaskSummary[]
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const results = useMemo(() => {
    const list = [
      ...documents.map((d) => ({
        title: d.title,
        kind: 'Document',
        category: d.category,
        href: '/dashboard#recent-documents',
      })),
      ...projects.map((p) => ({
        title: p.title,
        kind: 'Project',
        category: `${p.progress}% completed`,
        href: '/dashboard#projects',
      })),
      ...tasks.map((t) => ({
        title: t.title,
        kind: 'Task',
        category: `${t.priority} Priority · ${t.projectName}`,
        href: '/dashboard#tasks',
      })),
      { title: 'Workspace Settings', kind: 'Settings', category: 'Preferences & Team', href: '/settings' },
      { title: 'Team Collaboration Hub', kind: 'Team', category: '8 Members', href: '/dashboard#team' },
    ]

    if (!query.trim()) return list.slice(0, 6)
    return list
      .filter((item) => `${item.title} ${item.kind} ${item.category}`.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8)
  }, [documents, projects, tasks, query])

  return (
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-10 sm:h-11 w-full justify-between rounded-xl border-gray-200 bg-gray-50/70 px-3.5 text-gray-500 shadow-2xs hover:bg-gray-100/70 hover:border-[#6C4CF1]/30 transition"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Search className="size-4 shrink-0 text-gray-400" />
          <span className="truncate text-xs sm:text-sm font-medium">Search documents, projects, tasks...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-bold text-gray-500 shadow-2xs">
          <span>Ctrl</span>
          <span>+</span>
          <span>K</span>
        </kbd>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-gray-950/40 p-4 pt-[10vh] backdrop-blur-xs"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#E9E7F0] bg-white shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 px-5">
              <Search className="size-5 text-[#6C4CF1]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across documents, projects, tasks, and settings..."
                className="h-16 w-full bg-transparent text-base outline-none placeholder:text-gray-400 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-3">
              <p className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                {query ? 'Matching Results' : 'Suggested Resources'}
              </p>
              {results.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {results.map((res) => (
                    <Link
                      key={`${res.kind}-${res.title}`}
                      href={res.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3.5 py-2.5 transition hover:bg-[#F7F5FF] group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid size-8 place-items-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-[#6C4CF1]/10 group-hover:text-[#6C4CF1] transition">
                          <Command className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900 group-hover:text-[#6C4CF1]">
                            {res.title}
                          </p>
                          <p className="truncate text-xs text-gray-500">{res.category}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 group-hover:bg-[#6C4CF1]/10 group-hover:text-[#6C4CF1]">
                        {res.kind}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">
                  No matching workspace items found.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-3 text-xs text-gray-500">
              <span>Use arrows to navigate</span>
              <span>Press <kbd className="font-mono font-bold">Esc</kbd> to exit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
