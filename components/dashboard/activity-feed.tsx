'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowUpRight, CheckCircle2, FileText, FolderKanban, MessageSquare, Users2 } from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import type { ActivitySummary } from './dashboard-types'

export function ActivityTimeline({
  activities,
  onOpenTarget,
}: {
  activities: ActivitySummary[]
  onOpenTarget?: (target: string) => void
}) {
  const [filter, setFilter] = useState<'all' | 'document' | 'project' | 'task' | 'team'>('all')

  const filtered = activities.filter((item) => {
    if (filter === 'all') return true
    if (item.category) return item.category === filter
    const actionLower = item.action.toLowerCase()
    if (filter === 'document') return actionLower.includes('document') || actionLower.includes('roadmap') || actionLower.includes('brief')
    if (filter === 'project') return actionLower.includes('project')
    if (filter === 'task') return actionLower.includes('task')
    if (filter === 'team') return actionLower.includes('joined') || actionLower.includes('member')
    return true
  })

  return (
    <section id="activity-feed" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937]">Recent Activity</h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-[#6C4CF1]">
              Live Stream
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#6B7280]">Real-time activity audit log from workspace collaborators.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap rounded-xl bg-gray-100/80 p-1 text-xs font-bold text-gray-600">
          {(['all', 'document', 'project', 'task'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`rounded-lg px-2.5 py-1 capitalize transition ${
                filter === cat ? 'bg-white text-[#6C4CF1] shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              {cat === 'all' ? 'All' : `${cat}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline items */}
      <div className="mt-4 divide-y divide-gray-100">
        {filtered.map((item, idx) => (
          <div key={item.id || idx} className="flex items-center gap-3 py-3 rounded-xl px-2 hover:bg-[#F7F5FF]/50 transition">
            <UserAvatar initials={item.initials} name={item.name} size="md" tone={item.tone} />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700">
                <span className="font-extrabold text-[#1F2937]">{item.name}</span>{' '}
                <span className="text-gray-500">{item.action}</span>{' '}
                <span className="font-bold text-[#6C4CF1]">{item.target}</span>
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                {item.createdAt.includes('T') ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.createdAt}
              </p>
            </div>
            <ArrowUpRight className="size-4 text-gray-300 shrink-0" />
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-400">
            No activity records matching this filter.
          </div>
        )}
      </div>
    </section>
  )
}
