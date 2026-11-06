'use client'

import { useState } from 'react'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('Northstar Studio')

  return (
    <div className="min-h-screen bg-[#F7F5FF] text-[#1F2937] flex flex-col">
      {/* 1. Left Sidebar */}
      <AppSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Content Container */}
      <div
        className={`min-h-screen flex flex-col flex-1 transition-all duration-200 ${
          isSidebarCollapsed ? 'lg:pl-[78px]' : 'lg:pl-[288px]'
        }`}
      >
        <AppHeader
          onMenuClick={() => setMobileOpen(true)}
          workspaceName={workspaceName}
        />

        <main className="flex-1 flex flex-col justify-between mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-10 xl:px-12 py-8">
          <div className="flex-1 flex flex-col w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
