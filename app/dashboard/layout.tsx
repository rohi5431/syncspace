import type { Metadata } from 'next'
import { AppLayout } from '@/components/layout/AppLayout'

export const metadata: Metadata = {
  title: {
    template: '%s | SyncSpace',
    default: 'Dashboard | SyncSpace',
  },
  description: 'SyncSpace – Distributed Real-Time Collaboration Platform',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}
