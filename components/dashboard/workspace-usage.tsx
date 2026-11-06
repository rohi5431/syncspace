'use client'

import { Database, HardDrive, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import type { StorageSummary, WorkspaceSummary } from './dashboard-types'

export function WorkspaceUsage({
  storage,
  workspace,
}: {
  storage: StorageSummary
  workspace: WorkspaceSummary
}) {
  const toast = useToast()

  return (
    <section aria-label="Workspace storage and usage" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937]">Storage & Quotas</h2>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              Healthy
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#6B7280]">Real-time cloud asset consumption and team seats.</p>
        </div>

        <button
          type="button"
          onClick={() => toast('Your workspace has 8.8 GB remaining on the Pro tier.')}
          className="text-xs font-bold text-[#6C4CF1] hover:underline"
        >
          Manage Plan
        </button>
      </div>

      {/* Storage Progress */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-600">Attachment Storage</span>
          <span className="font-extrabold text-[#1F2937]">
            {storage.usedFormatted} of {storage.totalFormatted} ({storage.percent}%)
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#6C4CF1] transition-all duration-500"
            style={{ width: `${Math.max(storage.percent, 5)}%` }}
          />
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-gray-100 bg-[#F7F5FF]/50 p-3">
          <p className="font-medium text-gray-500">Team Seats</p>
          <p className="mt-1 text-base font-extrabold text-[#1F2937]">
            {workspace.currentSeats} / {workspace.seatQuota} <span className="text-xs font-normal text-gray-400">used</span>
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-[#F7F5FF]/50 p-3">
          <p className="font-medium text-gray-500">Tier Status</p>
          <p className="mt-1 text-base font-extrabold text-[#6C4CF1]">
            {workspace.plan}
          </p>
        </div>
      </div>

      {/* Breakdown detail */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#6C4CF1]" />
          <span>Docs & Text: 420 MB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#EC4899]" />
          <span>Media: 780 MB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#16A34A]" />
          <span>Snapshots: 80 MB</span>
        </div>
      </div>
    </section>
  )
}
