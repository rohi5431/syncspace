'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  CheckSquare2,
  FileText,
  FolderKanban,
  Plus,
  Sparkles,
  Users2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import {
  CreateDocumentDialog,
  CreateProjectDialog,
  InviteMemberDialog,
  PreviewDialog,
} from '@/components/dashboard/create-dialogs'
import type { DocumentSummary, ProjectSummary } from './dashboard-types'

const initialDocs: DocumentSummary[] = [
  {
    id: 'product-roadmap',
    title: 'Product roadmap — Q4 2026',
    category: 'Product strategy',
    authorName: 'Maya Chen',
    initials: 'MC',
    tone: 'indigo',
    updatedAt: 'Edited by Maya · 24m ago',
    collaborators: 3,
    accessLevel: 'Workspace Edit',
    starred: true,
  },
  {
    id: 'launch-brief',
    title: 'Launch campaign brief',
    category: 'Marketing',
    authorName: 'Rohit Kumar',
    initials: 'RK',
    tone: 'emerald',
    updatedAt: 'Edited by you · 2h ago',
    collaborators: 2,
    accessLevel: 'Workspace Edit',
    starred: false,
  },
  {
    id: 'redis-spec',
    title: 'Distributed Redis Pub/Sub Spec',
    category: 'Engineering specs',
    authorName: 'Jordan Lee',
    initials: 'JL',
    tone: 'amber',
    updatedAt: 'Edited by Jordan · Yesterday',
    collaborators: 4,
    accessLevel: 'Workspace Edit',
    starred: true,
  },
]

const initialProjects: ProjectSummary[] = [
  {
    id: 'website-refresh',
    title: 'Website refresh',
    description: 'A clearer story for the next chapter of SyncSpace.',
    progress: 68,
    dueDate: 'Due Nov 18',
    tone: 'indigo',
    status: 'In Progress',
    members: ['MC', 'JL', 'RK'],
    taskCount: 8,
  },
  {
    id: 'mobile-app',
    title: 'Mobile app launch',
    description: 'Bring the team workspace to every screen with offline sync.',
    progress: 42,
    dueDate: 'Due Dec 02',
    tone: 'emerald',
    status: 'In Progress',
    members: ['AS', 'RK', 'MC'],
    taskCount: 6,
  },
  {
    id: 'customer-onboarding',
    title: 'Customer onboarding',
    description: 'Make the first week feel effortless for distributed teams.',
    progress: 84,
    dueDate: 'Due Nov 12',
    tone: 'amber',
    status: 'On Track',
    members: ['JL', 'AS'],
    taskCount: 5,
  },
]

export function DashboardOverviewContent() {
  const [userName, setUserName] = useState('Rohit')
  const [greeting, setGreeting] = useState('Welcome')
  const [formattedDate, setFormattedDate] = useState('')
  const [documents, setDocuments] = useState<DocumentSummary[]>(initialDocs)
  const [projects, setProjects] = useState<ProjectSummary[]>(initialProjects)
  const [documentOpen, setDocumentOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [preview, setPreview] = useState<{ title: string; description: string } | null>(null)
  const toast = useToast()

  useEffect(() => {
    const updateDateAndGreeting = () => {
      const now = new Date()
      const hour = now.getHours()

      setGreeting(hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')
      setFormattedDate(
        new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(now),
      )
    }

    updateDateAndGreeting()
    const clockInterval = window.setInterval(updateDateAndGreeting, 60_000)

    try {
      const stored = localStorage.getItem('syncspace_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.name) {
          setUserName(parsed.name.split(' ')[0])
        }
      }
    } catch {
      // fallback
    }

    // Try fetching summary from backend API
    fetch('/api/dashboard/summary')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recentDocuments?.length) {
          setDocuments(data.recentDocuments)
        }
        if (data?.projects?.length) {
          setProjects(data.projects)
        }
      })
      .catch(() => {})

    return () => window.clearInterval(clockInterval)
  }, [])

  const handleCreateDocument = (doc: DocumentSummary) => {
    setDocuments((prev) => [doc, ...prev])
    toast(`“${doc.title}” added to your documents.`)
  }

  const handleCreateProject = (project: ProjectSummary) => {
    setProjects((prev) => [project, ...prev])
    toast(`“${project.title}” added to your projects.`)
  }

  const handleInvite = (email: string, role: string) => {
    toast(`Invitation sent to ${email} as ${role}.`)
  }

  return (
    <div className="space-y-10">
      {/* 1. WELCOME SECTION */}
      <section aria-label="Overview welcome" className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500">
            {formattedDate || <>&nbsp;</>}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#1F2937]">
            {greeting}, {userName}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-[#6B7280] font-normal">
            Here&apos;s what&apos;s happening in your workspace today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setProjectOpen(true)}
            className="h-11 sm:h-12 rounded-xl border-[#E9E7F0] bg-white px-4 sm:px-5 text-sm sm:text-base font-semibold text-gray-700 shadow-2xs hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
          >
            <FolderKanban className="size-4.5 text-gray-500" />
            <span>New project</span>
          </Button>
          <Button
            type="button"
            onClick={() => setDocumentOpen(true)}
            className="h-11 sm:h-12 rounded-xl bg-[#6C4CF1] px-5 sm:px-6 text-sm sm:text-base font-bold text-white shadow-md shadow-[#6C4CF1]/20 hover:bg-[#5738D6] transition"
          >
            <Plus className="size-5" />
            <span>Create document</span>
          </Button>
        </div>
      </section>

      {/* 2. FOUR STATISTICS CARDS */}
      <section aria-label="Workspace metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Active projects',
            value: '04',
            note: '2 moving this week',
            icon: FolderKanban,
            href: '/dashboard/projects',
            accent: 'text-[#EC4899] bg-[#EC4899]/10',
          },
          {
            label: 'Open tasks',
            value: '12',
            note: '5 due this week',
            icon: CheckSquare2,
            href: '/dashboard/tasks',
            accent: 'text-[#F59E0B] bg-[#F59E0B]/10',
          },
          {
            label: 'Shared documents',
            value: String(documents.length + 5).padStart(2, '0'),
            note: 'Updated live',
            icon: FileText,
            href: '/dashboard/documents',
            accent: 'text-[#6C4CF1] bg-[#6C4CF1]/10',
          },
          {
            label: 'Team members',
            value: '08',
            note: '3 online right now',
            icon: Sparkles,
            href: '/dashboard/team',
            accent: 'text-[#16A34A] bg-[#16A34A]/10',
          },
        ].map(({ label, value, note, icon: Icon, href, accent }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs transition hover:border-[#6C4CF1]/40 hover:-translate-y-0.5 hover:shadow-md block"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm sm:text-base font-bold text-[#6B7280]">{label}</p>
              <span className={`grid size-11 place-items-center rounded-xl transition ${accent}`}>
                <Icon aria-hidden="true" className="size-5.5" />
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1F2937]">{value}</span>
              <span className="text-xs sm:text-sm font-medium text-[#6B7280]">{note}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* 3. RECENT DOCUMENTS SECTION */}
      <section aria-label="Recent documents">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2937]">Recent documents</h2>
            <p className="mt-1 text-sm sm:text-base text-[#6B7280]">Pick up where your team left off with instant realtime sync.</p>
          </div>
          <Link
            href="/dashboard/documents"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#6C4CF1] hover:text-[#5738D6]"
          >
            <span>View all ({documents.length})</span>
            <ArrowRight aria-hidden="true" className="size-4.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {documents.slice(0, 3).map((doc) => (
            <article
              key={doc.id}
              className="group rounded-2xl border border-[#E9E7F0] bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-[#6C4CF1]/40 hover:shadow-md cursor-pointer"
              onClick={() => setPreview({ title: doc.title, description: `${doc.category} · ${doc.updatedAt}` })}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl border border-indigo-100 bg-indigo-50/70 text-[#6C4CF1] transition group-hover:bg-[#6C4CF1] group-hover:text-white">
                  <FileText aria-hidden="true" className="size-5" />
                </span>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                  {doc.category}
                </span>
              </div>
              <h3 className="mt-5 truncate text-base sm:text-lg font-bold text-[#1F2937] transition group-hover:text-[#6C4CF1]">
                {doc.title}
              </h3>
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-gray-100 pt-3.5">
                <span className="truncate text-xs sm:text-sm font-medium text-gray-500">{doc.updatedAt}</span>
                <UserAvatar initials={doc.initials} name={doc.authorName} size="sm" tone={doc.tone} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. ACTIVE PROJECTS SECTION */}
      <section aria-label="Active projects">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2937]">Active projects</h2>
            <p className="mt-1 text-sm sm:text-base text-[#6B7280]">Realtime progress tracking and team ownership.</p>
          </div>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#6C4CF1] hover:text-[#5738D6]"
          >
            <span>View all projects</span>
            <ArrowRight aria-hidden="true" className="size-4.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-[#E9E7F0] bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-[#6C4CF1]/40 hover:shadow-md cursor-pointer"
              onClick={() => setPreview({ title: project.title, description: `${project.description} (${project.progress}% complete)` })}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base sm:text-lg font-bold text-[#1F2937] hover:text-[#6C4CF1]">
                    {project.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 min-h-11 text-xs sm:text-sm leading-relaxed text-[#6B7280]">
                    {project.description}
                  </p>
                </div>
                <span
                  className={`mt-1.5 size-3 shrink-0 rounded-full ${
                    project.progress === 100
                      ? 'bg-[#16A34A]'
                      : project.tone === 'emerald'
                      ? 'bg-[#16A34A]'
                      : project.tone === 'amber'
                      ? 'bg-[#F59E0B]'
                      : 'bg-[#6C4CF1]'
                  }`}
                />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-[#6B7280]">Progress</span>
                  <span className="font-bold text-[#6C4CF1]">{project.progress}%</span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#6C4CF1] transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3.5">
                <span className="text-xs sm:text-sm font-semibold text-gray-500">{project.dueDate}</span>
                <div className="flex -space-x-2">
                  {project.members.map((initials, index) => (
                    <span
                      key={`${initials}-${index}`}
                      className="grid size-7 place-items-center rounded-full border-2 border-white bg-indigo-50 text-[10px] font-bold text-[#6C4CF1] shadow-2xs"
                    >
                      {initials}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. 2-COLUMN SPLIT GRID: RECENT ACTIVITY & TEAM MEMBERS */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        {/* Recent activity */}
        <section aria-label="Recent activity" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex items-start justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1F2937]">Recent activity</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Realtime activity stream from team updates.</p>
            </div>
            <Link
              href="/dashboard/documents"
              className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900"
            >
              <span>See all</span>
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {[
              { name: 'Maya Chen', initials: 'MC', tone: 'indigo' as const, action: 'updated', target: 'Product roadmap — Q4 2026', time: '24 min ago' },
              { name: 'Jordan Lee', initials: 'JL', tone: 'emerald' as const, action: 'completed a task in', target: 'Website refresh', time: '1 hour ago' },
              { name: 'Aisha Shah', initials: 'AS', tone: 'amber' as const, action: 'commented on', target: 'Launch campaign brief', time: '3 hours ago' },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3.5 py-3.5">
                <UserAvatar initials={item.initials} name={item.name} size="md" tone={item.tone} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-[#1F2937]">
                    <span className="font-bold">{item.name}</span> {item.action}{' '}
                    <span className="font-semibold text-[#6C4CF1]">{item.target}</span>
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team members */}
        <section aria-label="Team members" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex items-start justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1F2937]">Team members</h2>
              <p className="mt-1 text-sm text-[#6B7280]">3 teammates online right now.</p>
            </div>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#6C4CF1] hover:text-[#5738D6]"
            >
              <Plus aria-hidden="true" className="size-4" />
              <span>Invite</span>
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {[
              { name: 'Maya Chen', role: 'Product designer', initials: 'MC', tone: 'indigo' as const, online: true },
              { name: 'Jordan Lee', role: 'Engineering lead', initials: 'JL', tone: 'emerald' as const, online: true },
              { name: 'Aisha Shah', role: 'Product manager', initials: 'AS', tone: 'amber' as const, online: true },
              { name: 'Rohit Kumar', role: 'Workspace owner', initials: 'RK', tone: 'slate' as const, online: false },
            ].map((person) => (
              <div key={person.name} className="flex items-center gap-3.5 rounded-xl p-2 transition hover:bg-[#F7F5FF]">
                <UserAvatar initials={person.initials} name={person.name} tone={person.tone} size="md" status={person.online} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#1F2937]">{person.name}</p>
                  <p className="truncate text-xs font-medium text-[#6B7280]">{person.role}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                    person.online ? 'text-[#16A34A]' : 'text-gray-400'
                  }`}
                >
                  <span className={`size-2 rounded-full ${person.online ? 'bg-[#16A34A] animate-pulse' : 'bg-gray-300'}`} />
                  <span>{person.online ? 'Online' : 'Offline'}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-3">
            <Link
              href="/dashboard/team"
              className="text-xs font-bold text-[#6C4CF1] hover:underline flex items-center justify-between"
            >
              <span>Manage all team members</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* DIALOGS */}
      <CreateDocumentDialog
        open={documentOpen}
        onClose={() => setDocumentOpen(false)}
        onCreate={handleCreateDocument}
      />

      <CreateProjectDialog
        open={projectOpen}
        onClose={() => setProjectOpen(false)}
        onCreate={handleCreateProject}
      />

      <InviteMemberDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />

      <PreviewDialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title ?? ''}
        description={preview?.description ?? ''}
      />
    </div>
  )
}
