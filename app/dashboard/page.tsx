import type { Metadata } from 'next'
import { DashboardOverviewContent } from '@/components/dashboard/overview-content'

export const metadata: Metadata = { title: 'Dashboard Overview | SyncSpace' }

export default function DashboardPage() {
  return <DashboardOverviewContent />
}
