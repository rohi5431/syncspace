import type { Metadata } from 'next'
import { HelpCenterView } from '@/components/help/help-center-view'

export const metadata: Metadata = {
  title: 'Help Center | SyncSpace',
  description: 'Guides, API tutorials, FAQs, and engineering support for SyncSpace.',
}

export default function HelpPage() {
  return <HelpCenterView />
}
