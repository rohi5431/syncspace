'use client'

import Link from 'next/link'
import { HelpCircle, Menu } from 'lucide-react'
import { Breadcrumbs } from './Breadcrumbs'
import { GlobalSearch } from './GlobalSearch'
import { NotificationButton } from './NotificationButton'
import { UserProfileMenu } from './UserProfileMenu'

export function AppHeader({
  onMenuClick,
  workspaceName = 'Northstar Studio',
}: {
  onMenuClick: () => void
  workspaceName?: string
}) {
  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#E9E7F0] bg-white/95 px-4 backdrop-blur sm:px-8 lg:px-10 xl:px-12">
      {/* Left: Mobile Toggle + Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid size-10 place-items-center rounded-xl text-gray-500 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="size-6" />
        </button>

        <Breadcrumbs workspaceName={workspaceName} />
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-md mx-4">
        <GlobalSearch />
      </div>

      {/* Right: Realtime status + Notifications + Help + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden xl:inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Realtime Connected</span>
        </div>

        <NotificationButton />

        <Link
          href="/dashboard/help"
          className="hidden sm:grid size-10 sm:size-11 place-items-center rounded-xl border border-[#E9E7F0] bg-white text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition shadow-2xs"
          aria-label="Help & Documentation"
          title="Help Center"
        >
          <HelpCircle className="size-5" />
        </Link>

        <div className="hidden sm:block h-7 w-px bg-gray-200 mx-1" />

        <UserProfileMenu />
      </div>
    </header>
  )
}
