import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { WorkspaceProvider } from '@/components/dashboard/workspace-provider'

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceProvider><DashboardShell>{children}</DashboardShell></WorkspaceProvider>
}
