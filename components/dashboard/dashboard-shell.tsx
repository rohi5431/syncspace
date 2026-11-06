'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { useAuth } from '@/lib/api-client'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { error, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && error?.status === 401) router.replace('/login')
  }, [error, isLoading, router])

  const handleNavigationToggle = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) setSidebarCollapsed((collapsed) => !collapsed)
    else setMobileOpen(true)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background p-0 lg:p-3">
      <Suspense fallback={<div aria-hidden="true" className="fixed inset-y-3 left-3 hidden w-[254px] rounded-[24px] border border-border bg-white lg:block" />}>
        <AppSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((collapsed) => !collapsed)}
        />
      </Suspense>
      <div className={`min-h-screen transition-[padding] duration-200 lg:min-h-[calc(100vh-24px)] ${sidebarCollapsed ? 'lg:pl-[92px]' : 'lg:pl-[274px]'}`}>
        <div className="mx-auto min-h-screen max-w-[1800px] overflow-visible border-border bg-surface-muted shadow-sm lg:min-h-[calc(100vh-24px)] lg:overflow-hidden lg:rounded-[26px] lg:border">
          <DashboardHeader onMenuClick={handleNavigationToggle} />
          <main id="main-content" className="mx-auto max-w-[1540px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-primary">Skip to content</a>
            <div key={pathname}>{children}</div>
            <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-[11px] text-muted-foreground">
              <span>© {new Date().getFullYear()} SyncSpace</span>
              <div className="flex items-center gap-4"><button type="button" onClick={() => window.dispatchEvent(new CustomEvent('syncspace:help'))} className="transition hover:text-foreground">Help</button><span aria-disabled="true" title="Policy not published">Privacy</span><span aria-disabled="true" title="Policy not published">Terms</span><span>v1.0</span></div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
