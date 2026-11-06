import type { Metadata } from 'next'
import { SettingsView } from '@/components/settings/settings-view'

export const metadata: Metadata = {
  title: 'Settings | SyncSpace',
  description: 'Manage personal profile, account security, workspace preferences, and appearance.',
}

export default function SettingsPage() {
  return <SettingsView />
}
