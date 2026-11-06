'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/documents': 'My Documents',
  '/dashboard/recent-documents': 'Recent Documents',
  '/dashboard/projects': 'Projects',
  '/dashboard/tasks': 'Tasks',
  '/dashboard/team': 'Team Members',
  '/dashboard/settings': 'Settings',
  '/dashboard/help': 'Help Center',
}

export function Breadcrumbs({ workspaceName = 'Northstar Studio' }: { workspaceName?: string }) {
  const pathname = usePathname()

  let currentPageTitle = routeTitles[pathname]
  if (!currentPageTitle) {
    if (pathname.startsWith('/dashboard/projects/')) {
      currentPageTitle = 'Project Details'
    } else {
      currentPageTitle = 'Dashboard'
    }
  }

  return (
    <div className="hidden sm:flex flex-col">
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
        <Link href="/dashboard" className="hover:text-gray-600 transition">Workspace</Link>
        <ChevronRight className="size-3 text-gray-300" />
        <Link href="/dashboard" className="text-gray-600 font-bold hover:text-[#6C4CF1] transition">{workspaceName}</Link>
        <ChevronRight className="size-3 text-gray-300" />
        <span className="text-[#6C4CF1] font-bold">{currentPageTitle}</span>
      </nav>
      <h1 className="text-base lg:text-lg font-extrabold text-[#1F2937] tracking-tight">{currentPageTitle}</h1>
    </div>
  )
}
