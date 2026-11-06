import type { Metadata } from 'next'
import { SettingsApp } from '@/components/dashboard/settings-app'

export const metadata: Metadata = { title: 'Workspace settings' }

export default function SettingsPage() {
  return <SettingsApp />
}
