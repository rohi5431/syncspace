'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, ChevronRight } from 'lucide-react'
import { useToast } from '@/components/providers/toast-provider'

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  category: 'document' | 'task' | 'team' | 'security'
  read: boolean
  targetHref: string
}

const defaultNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Document shared with you',
    message: 'Maya Chen shared "Product roadmap — Q4 2026" with edit permissions.',
    time: '12m ago',
    category: 'document',
    read: false,
    targetHref: '/dashboard/documents',
  },
  {
    id: 'n2',
    title: 'Task assigned',
    message: 'Jordan Lee assigned you "Audit Redis pub/sub queue latency" with high priority.',
    time: '45m ago',
    category: 'task',
    read: false,
    targetHref: '/dashboard/tasks',
  },
  {
    id: 'n3',
    title: 'Workspace invitation accepted',
    message: 'Aisha Shah joined Northstar Studio as Product Manager.',
    time: '2h ago',
    category: 'team',
    read: true,
    targetHref: '/dashboard/team',
  },
  {
    id: 'n4',
    title: 'Milestone reached',
    message: 'Website refresh project reached 68% completion.',
    time: '5h ago',
    category: 'task',
    read: true,
    targetHref: '/dashboard/projects',
  },
]

export function NotificationButton() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const menuRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast('All notifications marked as read.')
  }

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative grid size-10 sm:size-11 place-items-center rounded-xl border border-[#E9E7F0] bg-white text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition shadow-2xs"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-[#EC4899] text-[10px] font-extrabold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
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
                onClick={markAllRead}
                className="text-xs font-semibold text-[#6C4CF1] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 pb-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filter === 'all'
                  ? 'bg-[#6C4CF1] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filter === 'unread'
                  ? 'bg-[#6C4CF1] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-gray-100">
            {notifications
              .filter((n) => (filter === 'unread' ? !n.read : true))
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => markRead(item.id)}
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
                      onClick={() => setOpen(false)}
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
  )
}
