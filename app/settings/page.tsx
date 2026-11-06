import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { SettingsApp } from '@/components/dashboard/settings-app'
import { WorkspaceProvider } from '@/components/dashboard/workspace-provider'

export const metadata: Metadata = { title: 'Workspace settings' }

export default function SettingsPage() {
  return <WorkspaceProvider><DashboardShell><Suspense fallback={<div className="rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground" role="status">Loading settings…</div>}><SettingsApp /></Suspense></DashboardShell></WorkspaceProvider>
}
