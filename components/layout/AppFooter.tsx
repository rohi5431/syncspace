'use client'

import Link from 'next/link'
import { Brand } from '@/components/brand/brand'

export function AppFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`border-t border-[#E9E7F0] bg-white px-6 py-6 text-gray-500 rounded-2xl shadow-2xs ${className || 'mt-12'}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Brand href="/dashboard" size="sm" />
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs font-medium text-gray-500">
            © 2026 SyncSpace Inc. All rights reserved.
          </span>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-600">
          <Link href="/dashboard/help" className="hover:text-[#6C4CF1] transition">
            Help Center
          </Link>
          <Link href="/dashboard/settings" className="hover:text-[#6C4CF1] transition">
            Documentation
          </Link>
          <Link href="/dashboard/settings" className="hover:text-[#6C4CF1] transition">
            Privacy Policy
          </Link>
          <Link href="/dashboard/settings" className="hover:text-[#6C4CF1] transition">
            Terms of Service
          </Link>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-mono font-bold text-gray-500">
            v2.4.0-prod
          </span>
        </nav>
      </div>
    </footer>
  )
}
