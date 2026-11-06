'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { useAuth } from '@/lib/api-client'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { error, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && error?.status === 401) router.replace('/login')
  }, [error, isLoading, router])

  return <div className="min-h-screen bg-white">
    <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    <div className="min-h-screen lg:pl-[264px]">
      <DashboardHeader onMenuClick={() => setMobileOpen(true)} />
      <main id="main-content" className="mx-auto max-w-[1440px] px-4 pb-12 pt-7 sm:px-6 lg:px-8">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-indigo-700">Skip to content</a>
        <div key={pathname}>{children}</div>
      </main>
    </div>
  </div>
}
