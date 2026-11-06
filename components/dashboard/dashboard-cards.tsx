'use client'

import { ArrowUpRight, CalendarDays, FileText, MoreHorizontal } from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import type { DocumentItem, ProjectItem } from '@/lib/demo-data'

export function DocumentCard({
  document,
  onOpen,
}: {
  document: DocumentItem
  onOpen: (document: DocumentItem) => void
}) {
  return (
    <article className="group rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5">
      <button type="button" onClick={() => onOpen(document)} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-xl border border-indigo-100 bg-indigo-50/70 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
            <FileText aria-hidden="true" className="size-5" />
          </span>
          <MoreHorizontal aria-hidden="true" className="size-5 text-gray-300 transition group-hover:text-gray-600" />
        </div>
        <h3 className="mt-5 truncate text-base sm:text-lg font-bold text-gray-950 transition group-hover:text-indigo-600">
          {document.title}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-gray-500">{document.category}</p>
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-gray-100 pt-3.5">
          <span className="truncate text-xs sm:text-sm font-medium text-gray-400">{document.updatedAt}</span>
          <UserAvatar initials={document.initials} name={document.author} size="sm" tone={document.tone} />
        </div>
      </button>
    </article>
  )
}

export function ProjectCard({
  project,
  onOpen,
}: {
  project: ProjectItem
  onOpen: (project: ProjectItem) => void
}) {
  return (
    <article className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => onOpen(project)} className="min-w-0 text-left flex-1">
          <h3 className="truncate text-base sm:text-lg font-bold text-gray-950 hover:text-indigo-600">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-11 text-xs sm:text-sm leading-relaxed text-gray-600 font-normal">
            {project.description}
          </p>
        </button>
        <span
          className={`mt-1.5 size-3 shrink-0 rounded-full ${
            project.tone === 'indigo'
              ? 'bg-indigo-500'
              : project.tone === 'emerald'
              ? 'bg-emerald-500'
              : project.tone === 'amber'
              ? 'bg-amber-500'
              : 'bg-slate-500'
          }`}
          aria-label={`${project.tone} project`}
        />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-gray-600">Progress</span>
          <span className="font-bold text-indigo-700">{project.progress}%</span>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3.5">
        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500">
          <CalendarDays aria-hidden="true" className="size-4 text-gray-400" />
          <span>{project.dueDate}</span>
        </span>
        <div className="flex -space-x-2">
          {project.members.map((initials, index) => (
            <span
              key={`${initials}-${index}`}
              className="grid size-7 place-items-center rounded-full border-2 border-white bg-indigo-50 text-[10px] font-bold text-indigo-700 shadow-2xs"
              title={`Team member ${initials}`}
            >
              {initials}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export function ActivityFeed() {
  const activity = [
    { name: 'Maya Chen', initials: 'MC', tone: 'indigo' as const, action: 'updated', target: 'Product roadmap — Q4 2026', time: '24 min ago' },
    { name: 'Jordan Lee', initials: 'JL', tone: 'emerald' as const, action: 'completed a task in', target: 'Website refresh', time: '1 hour ago' },
    { name: 'Aisha Shah', initials: 'AS', tone: 'amber' as const, action: 'commented on', target: 'Launch campaign brief', time: '3 hours ago' },
  ]

  return (
    <div className="flex flex-col">
      {activity.map((item, index) => (
        <div
          key={item.name}
          className={`flex items-center gap-3.5 py-3.5 ${index < activity.length - 1 ? 'border-b border-gray-100' : ''}`}
        >
          <UserAvatar initials={item.initials} name={item.name} size="md" tone={item.tone} />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-gray-700">
              <span className="font-bold text-gray-950">{item.name}</span> {item.action}{' '}
              <span className="font-semibold text-gray-900">{item.target}</span>
            </p>
            <p className="mt-0.5 text-xs font-medium text-gray-400">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function OnlineMembers() {
  const people = [
    { name: 'Maya Chen', role: 'Product designer', initials: 'MC', tone: 'indigo' as const, online: true },
    { name: 'Jordan Lee', role: 'Engineering lead', initials: 'JL', tone: 'emerald' as const, online: true },
    { name: 'Aisha Shah', role: 'Product manager', initials: 'AS', tone: 'amber' as const, online: true },
    { name: 'Rohit Kumar', role: 'Workspace owner', initials: 'RK', tone: 'slate' as const, online: false },
  ]

  return (
    <div className="flex flex-col gap-3.5">
      {people.map((person) => (
        <div key={person.name} className="flex items-center gap-3.5 rounded-xl p-1.5 transition hover:bg-gray-50">
          <UserAvatar initials={person.initials} name={person.name} tone={person.tone} size="md" status={person.online} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-950">{person.name}</p>
            <p className="truncate text-xs font-medium text-gray-500">{person.role}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold ${
              person.online ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <span
              className={`size-2 rounded-full ${person.online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}
            />
            <span>{person.online ? 'Online' : 'Offline'}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
