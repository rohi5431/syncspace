'use client'

import { Calendar, ChevronRight, Clock, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UpcomingDeadlines({
  onViewCalendar,
}: {
  onViewCalendar?: () => void
}) {
  const deadlines = [
    {
      id: 'd1',
      title: 'Q4 Product Roadmap Final Review',
      project: 'Website refresh',
      date: 'Tomorrow, Nov 7',
      urgent: true,
      tag: 'Critical Milestone',
    },
    {
      id: 'd2',
      title: 'Redis Cluster Scalability Audit',
      project: 'Realtime Infrastructure',
      date: 'In 3 days, Nov 9',
      urgent: false,
      tag: 'Engineering Sprint',
    },
    {
      id: 'd3',
      title: 'Mobile App Beta Feedback Review',
      project: 'Mobile app v2',
      date: 'Next week, Nov 14',
      urgent: false,
      tag: 'User Research',
    },
  ]

  return (
    <section id="calendar-deadlines" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs scroll-mt-24">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937]">Upcoming Deadlines</h2>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">
              {deadlines.length} Due Soon
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#6B7280]">Key project milestones and sprint deliverables.</p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onViewCalendar}
          className="h-8 rounded-lg border-gray-200 text-xs font-bold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
        >
          <Calendar className="size-3.5" />
          <span>Calendar</span>
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {deadlines.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between rounded-xl border p-3.5 transition ${
              item.urgent
                ? 'border-rose-200/80 bg-rose-50/30'
                : 'border-gray-100 bg-[#F7F5FF]/40 hover:bg-[#F7F5FF]'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${item.urgent ? 'bg-rose-500 animate-ping' : 'bg-[#6C4CF1]'}`}
                />
                <p className="truncate text-xs sm:text-sm font-bold text-[#1F2937]">{item.title}</p>
              </div>
              <p className="mt-1 text-[11px] font-medium text-gray-500">
                {item.project} · <span className="font-semibold text-[#6C4CF1]">{item.tag}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span
                className={`rounded-md px-2 py-1 text-[11px] font-bold ${
                  item.urgent ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {item.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
