'use client'

import { ArrowUpRight, CalendarDays, FileText, MoreHorizontal } from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import type { DocumentItem, ProjectItem } from '@/lib/demo-data'

export function DocumentCard({ document, onOpen }: { document: DocumentItem; onOpen: (document: DocumentItem) => void }) {
  return <article className="group rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"><button type="button" onClick={() => onOpen(document)} className="w-full text-left"><div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg border border-gray-100 bg-gray-50 text-indigo-600"><FileText aria-hidden="true" className="size-[17px]" /></span><MoreHorizontal aria-hidden="true" className="size-4 text-gray-300 transition group-hover:text-gray-500" /></div><h3 className="mt-4 truncate text-sm font-semibold text-gray-900">{document.title}</h3><p className="mt-1 text-xs text-gray-500">{document.category}</p><div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3"><span className="truncate text-[11px] text-gray-400">{document.updatedAt}</span><UserAvatar initials={document.initials} name={document.author} size="sm" tone={document.tone} /></div></button></article>
}

export function ProjectCard({ project, onOpen }: { project: ProjectItem; onOpen: (project: ProjectItem) => void }) {
  return <article className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"><div className="flex items-start justify-between gap-3"><button type="button" onClick={() => onOpen(project)} className="min-w-0 text-left"><h3 className="truncate text-sm font-semibold text-gray-900 hover:text-indigo-700">{project.title}</h3><p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-gray-500">{project.description}</p></button><span className={`mt-1 size-2.5 shrink-0 rounded-full ${project.tone === 'indigo' ? 'bg-indigo-500' : project.tone === 'emerald' ? 'bg-emerald-500' : project.tone === 'amber' ? 'bg-amber-500' : 'bg-slate-500'}`} aria-label={`${project.tone} project`} /> </div><div className="mt-4"><div className="flex items-center justify-between text-[11px]"><span className="font-medium text-gray-600">Progress</span><span className="font-semibold text-gray-700">{project.progress}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${project.progress}%` }} /></div></div><div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3"><span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500"><CalendarDays aria-hidden="true" className="size-3.5" />{project.dueDate}</span><div className="flex -space-x-2">{project.members.map((initials, index) => <span key={`${initials}-${index}`} className="grid size-6 place-items-center rounded-full border-2 border-white bg-indigo-50 text-[8px] font-semibold text-indigo-700" title={`Team member ${initials}`}>{initials}</span>)}</div></div></article>
}

export function ActivityFeed() {
  const activity = [
    { name: 'Maya Chen', initials: 'MC', tone: 'indigo' as const, action: 'updated', target: 'Product roadmap — Q4 2026', time: '24 min ago' },
    { name: 'Jordan Lee', initials: 'JL', tone: 'emerald' as const, action: 'completed a task in', target: 'Website refresh', time: '1 hour ago' },
    { name: 'Aisha Shah', initials: 'AS', tone: 'amber' as const, action: 'commented on', target: 'Launch campaign brief', time: '3 hours ago' },
  ]
  return <div className="flex flex-col">{activity.map((item, index) => <div key={item.name} className={`flex gap-3 py-3 ${index < activity.length - 1 ? 'border-b border-gray-100' : ''}`}><UserAvatar initials={item.initials} name={item.name} size="sm" tone={item.tone} /><div className="min-w-0 flex-1"><p className="text-xs leading-5 text-gray-600"><span className="font-semibold text-gray-900">{item.name}</span> {item.action} <span className="font-medium text-gray-800">{item.target}</span></p><p className="mt-1 text-[10px] text-gray-400">{item.time}</p></div></div>)}</div>
}

export function OnlineMembers() {
  const people = [
    { name: 'Maya Chen', role: 'Product designer', initials: 'MC', tone: 'indigo' as const, online: true },
    { name: 'Jordan Lee', role: 'Engineering lead', initials: 'JL', tone: 'emerald' as const, online: true },
    { name: 'Aisha Shah', role: 'Product manager', initials: 'AS', tone: 'amber' as const, online: true },
    { name: 'Rohit Kumar', role: 'Workspace owner', initials: 'RK', tone: 'slate' as const, online: false },
  ]
  return <div className="flex flex-col gap-3">{people.map((person) => <div key={person.name} className="flex items-center gap-2.5"><UserAvatar initials={person.initials} name={person.name} tone={person.tone} size="sm" status={person.online} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-gray-800">{person.name}</p><p className="mt-0.5 truncate text-[10px] text-gray-500">{person.role}</p></div><span className={`text-[10px] ${person.online ? 'text-green-600' : 'text-gray-400'}`}>{person.online ? 'Online' : 'Away'}</span></div>)}</div>
}
