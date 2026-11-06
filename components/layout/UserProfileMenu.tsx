'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Keyboard, LogOut, Settings, User } from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { useToast } from '@/components/providers/toast-provider'

export function UserProfileMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl p-1 hover:bg-[#F7F5FF] transition"
        aria-label="User profile menu"
      >
        <UserAvatar initials={currentUser.initials} name={currentUser.name} tone={currentUser.tone} size="md" />
        <ChevronDown className="hidden sm:block size-4 text-gray-400" />
      </button>

      {open && (
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
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
            >
              <User className="size-4 text-gray-400" />
              <span>Profile Settings</span>
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
            >
              <Settings className="size-4 text-gray-400" />
              <span>Workspace Settings</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                toast('Keyboard Shortcuts: Ctrl+K (Search), Ctrl+N (New Document), Esc (Dismiss)')
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
  )
}
