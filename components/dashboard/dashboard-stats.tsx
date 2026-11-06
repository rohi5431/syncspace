'use client'

import { ArrowUpRight, CheckSquare2, FileText, FolderKanban, Users2 } from 'lucide-react'
import type { DashboardData } from './dashboard-types'

export function DashboardStats({
  stats,
  onNavigateSection,
}: {
  stats: DashboardData['stats']
  onNavigateSection?: (sectionId: string) => void
}) {
  const cards = [
    {
      id: 'recent-documents',
      label: 'Total Documents',
      value: String(stats.documents.total).padStart(2, '0'),
      change: stats.documents.trendPercent || '+14.2%',
      changePositive: true,
      subtext: stats.documents.changeNote || 'vs last 30 days',
      icon: FileText,
      accentColor: 'text-[#6C4CF1]',
      bgAccent: 'bg-[#6C4CF1]/10',
      borderHover: 'hover:border-[#6C4CF1]/40',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    },
    {
      id: 'projects',
      label: 'Active Projects',
      value: String(stats.projects.active ?? stats.projects.total).padStart(2, '0'),
      change: `${stats.projects.completed || 1} completed`,
      changePositive: true,
      subtext: `${stats.projects.total} total initiatives`,
      icon: FolderKanban,
      accentColor: 'text-[#EC4899]',
      bgAccent: 'bg-[#EC4899]/10',
      borderHover: 'hover:border-[#EC4899]/40',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200/60',
    },
    {
      id: 'tasks',
      label: 'Pending Tasks',
      value: String(stats.tasks.pending ?? stats.tasks.total).padStart(2, '0'),
      change: `${stats.tasks.overdue || 2} overdue`,
      changePositive: false,
      subtext: '5 due this week',
      icon: CheckSquare2,
      accentColor: 'text-[#F59E0B]',
      bgAccent: 'bg-[#F59E0B]/10',
      borderHover: 'hover:border-[#F59E0B]/40',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200/60',
    },
    {
      id: 'team',
      label: 'Team Members',
      value: String(stats.team.total).padStart(2, '0'),
      change: `${stats.team.online || 3} online now`,
      changePositive: true,
      subtext: 'Real-time presence active',
      icon: Users2,
      accentColor: 'text-[#16A34A]',
      bgAccent: 'bg-[#16A34A]/10',
      borderHover: 'hover:border-[#16A34A]/40',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    },
  ]

  return (
    <section aria-label="Dashboard statistics cards" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onNavigateSection?.(card.id)}
            className={`group flex flex-col justify-between rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 text-left shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${card.borderHover}`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-sm sm:text-base font-bold text-[#6B7280]">{card.label}</span>
              <span
                className={`grid size-11 place-items-center rounded-xl transition ${card.bgAccent} ${card.accentColor} group-hover:scale-110`}
              >
                <Icon aria-hidden="true" className="size-5.5" />
              </span>
            </div>

            <div className="mt-5 flex items-baseline justify-between w-full">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1F2937]">
                {card.value}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${card.tagColor}`}
              >
                {card.changePositive && <ArrowUpRight className="size-3" />}
                <span>{card.change}</span>
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs sm:text-sm font-medium text-gray-400 w-full">
              <span>{card.subtext}</span>
              <span className="text-xs font-bold text-[#6C4CF1] opacity-0 transition group-hover:opacity-100 flex items-center gap-0.5">
                <span>View</span>
                <ArrowUpRight className="size-3.5" />
              </span>
            </div>
          </button>
        )
      })}
    </section>
  )
}
