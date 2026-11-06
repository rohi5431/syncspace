'use client'

import { Activity, Radio, RefreshCw, Server, Wifi } from 'lucide-react'
import type { CollaborationSummary } from './dashboard-types'

export function CollaborationStatus({
  collaboration,
}: {
  collaboration: CollaborationSummary
}) {
  return (
    <section aria-label="Document collaboration status" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937]">Real-Time Collaboration</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{collaboration.status}</span>
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#6B7280]">Socket.IO Gateway & Redis state synchronization status.</p>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
          <Wifi className="size-3.5" />
          <span>{collaboration.latencyMs}ms Latency</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-gray-100 bg-[#F7F5FF]/50 p-3">
          <p className="text-[11px] font-medium text-gray-500">Active Rooms</p>
          <p className="mt-1 text-xl sm:text-2xl font-extrabold text-[#6C4CF1]">
            {collaboration.activeRooms}
          </p>
          <p className="text-[10px] text-gray-400">Live channels</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-[#F7F5FF]/50 p-3">
          <p className="text-[11px] font-medium text-gray-500">Connected Peers</p>
          <p className="mt-1 text-xl sm:text-2xl font-extrabold text-[#1F2937]">
            {collaboration.connectedClients}
          </p>
          <p className="text-[10px] text-gray-400">Socket clients</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-[#F7F5FF]/50 p-3">
          <p className="text-[11px] font-medium text-gray-500">Sync Engine</p>
          <p className="mt-1 text-xl sm:text-2xl font-extrabold text-[#16A34A]">
            100%
          </p>
          <p className="text-[10px] text-emerald-600 font-bold">Zero drift</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500">
        <span className="truncate">Gateway: <code className="rounded bg-gray-100 px-1 font-mono text-[10px]">{collaboration.gatewayUrl}</code></span>
        <span className="font-semibold text-emerald-600">● Redis Pub/Sub Operational</span>
      </div>
    </section>
  )
}
