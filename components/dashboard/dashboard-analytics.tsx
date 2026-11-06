'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'

export function DashboardAnalytics() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [activeTooltip, setActiveTooltip] = useState<{ day: string; docs: number; tasks: number } | null>(null)

  // Chart datasets depending on range
  const datasets = {
    '7d': [
      { day: 'Mon', docs: 2, tasks: 4 },
      { day: 'Tue', docs: 4, tasks: 6 },
      { day: 'Wed', docs: 3, tasks: 5 },
      { day: 'Thu', docs: 6, tasks: 8 },
      { day: 'Fri', docs: 5, tasks: 7 },
      { day: 'Sat', docs: 2, tasks: 3 },
      { day: 'Sun', docs: 1, tasks: 2 },
    ],
    '30d': [
      { day: 'W1', docs: 12, tasks: 18 },
      { day: 'W2', docs: 16, tasks: 24 },
      { day: 'W3', docs: 14, tasks: 22 },
      { day: 'W4', docs: 22, tasks: 31 },
    ],
    '90d': [
      { day: 'Aug', docs: 45, tasks: 68 },
      { day: 'Sep', docs: 58, tasks: 84 },
      { day: 'Oct', docs: 72, tasks: 104 },
    ],
  }

  const currentData = datasets[dateRange]
  const maxVal = Math.max(...currentData.map((d) => Math.max(d.docs, d.tasks))) * 1.25

  return (
    <section id="analytics" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937]">Workspace Analytics</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <TrendingUp className="size-3" />
              <span>+24% Velocity</span>
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
            Track document collaboration velocity, completed sprint tasks, and project momentum.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex rounded-xl bg-gray-100/80 p-1 text-xs font-bold text-gray-600">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              className={`rounded-lg px-3 py-1.5 transition ${
                dateRange === range ? 'bg-white text-[#6C4CF1] shadow-2xs font-extrabold' : 'hover:text-gray-900'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Tasks Completed vs Documents Created */}
        <div className="rounded-2xl border border-gray-100 bg-[#F7F5FF]/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1F2937]">Deliverable Throughput</h3>
              <p className="text-xs text-gray-500">Tasks completed (purple) vs Documents created (pink)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#6C4CF1]">
                <span className="size-2 rounded-full bg-[#6C4CF1]" />
                <span>Tasks</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#EC4899]">
                <span className="size-2 rounded-full bg-[#EC4899]" />
                <span>Docs</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="relative mt-6 h-48 w-full flex items-end justify-between gap-4 pt-4 border-b border-gray-200">
            {currentData.map((item) => {
              const taskHeight = (item.tasks / maxVal) * 100
              const docHeight = (item.docs / maxVal) * 100

              return (
                <div
                  key={item.day}
                  onMouseEnter={() => setActiveTooltip(item)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="group relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                >
                  <div className="flex items-end gap-1.5 w-full max-w-[48px] justify-center h-full">
                    {/* Task Bar */}
                    <div
                      className="w-1/2 rounded-t-md bg-[#6C4CF1] transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${taskHeight}%` }}
                    />
                    {/* Doc Bar */}
                    <div
                      className="w-1/2 rounded-t-md bg-[#EC4899] transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${docHeight}%` }}
                    />
                  </div>

                  <span className="mt-2 text-[11px] font-bold text-gray-500">{item.day}</span>

                  {/* Tooltip */}
                  {activeTooltip?.day === item.day && (
                    <div className="absolute -top-12 z-20 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl animate-in fade-in">
                      {item.tasks} Tasks · {item.docs} Docs
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Chart 2: Project Health & Status Breakdown */}
        <div className="rounded-2xl border border-gray-100 bg-[#F7F5FF]/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1F2937]">Project Status Distribution</h3>
              <p className="text-xs text-gray-500">Active milestone distribution across initiatives</p>
            </div>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              100% On Schedule
            </span>
          </div>

          <div className="mt-6 flex flex-col justify-center gap-4">
            {[
              { label: 'On Track / Active', percent: 75, count: '3 projects', color: 'bg-[#6C4CF1]' },
              { label: 'Completed Sprints', percent: 25, count: '1 project', color: 'bg-[#16A34A]' },
              { label: 'At Risk / Delayed', percent: 0, count: '0 projects', color: 'bg-[#DC2626]' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span>{stat.label}</span>
                  <span className="font-bold text-[#1F2937]">{stat.count} ({stat.percent}%)</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-gray-200/80">
                  <div
                    className={`h-full rounded-full ${stat.color} transition-all duration-500`}
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-200/60 pt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Average sprint velocity: <strong className="text-gray-900">4.8 tasks/day</strong></span>
            <span>Realtime data verified</span>
          </div>
        </div>
      </div>
    </section>
  )
}
