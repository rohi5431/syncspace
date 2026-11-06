import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/providers/toast-provider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SyncSpace — Work together, build together',
    template: '%s · SyncSpace',
  },
  description:
    'A secure shared workspace for your team’s documents, folders, permissions, and activity.',
  generator: 'v0.app',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
