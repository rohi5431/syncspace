'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Calendar,
  CheckSquare2,
  FolderKanban,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import { CreateProjectDialog } from '@/components/dashboard/create-dialogs'
import type { ProjectSummary } from '@/components/dashboard/dashboard-types'

export function ProjectsManager() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Progress' | 'On Track' | 'Completed'>('All')
  const [sortBy, setSortBy] = useState<'progress' | 'due' | 'name'>('progress')
  const [createOpen, setCreateOpen] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    let active = true
    fetch('/api/projects')
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text() || 'Unable to load projects')
        return response.json()
      })
      .then((items: Array<Record<string, unknown>>) => {
        if (!active) return
        setProjects(items.map((item) => ({
          id: String(item.id),
          title: String(item.title),
          description: String(item.description ?? ''),
          progress: Number(item.progress ?? 0),
          dueDate: String(item.dueDate ?? 'No due date'),
          tone: (item.tone as ProjectSummary['tone']) ?? 'indigo',
          status: Number(item.progress ?? 0) >= 100 ? 'Completed' : 'In Progress',
          members: Array.isArray(item.members) ? item.members.map(String) : [],
          taskCount: Array.isArray(item.tasks) ? item.tasks.length : 0,
          template: String(item.template ?? 'web-application-development'),
        })))
      })
      .catch((error: unknown) => {
        if (active) toast(error instanceof Error ? error.message : 'Unable to load projects')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [toast])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      }
      return true
    }).sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      return a.dueDate.localeCompare(b.dueDate)
    })
  }, [projects, statusFilter, search, sortBy])

  const handleDelete = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await response.text() || 'Unable to delete project')
      setProjects((prev) => prev.filter((project) => project.id !== id))
      toast(`Deleted “${title}”.`)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to delete project')
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#E9E7F0] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
              Projects
            </h1>
            <span className="rounded-full bg-[#EC4899]/10 px-2.5 py-0.5 text-xs font-bold text-[#EC4899]">
              {projects.length} Active
            </span>
          </div>
          <p className="mt-1 text-sm sm:text-base text-[#6B7280]">
            Track deliverables, assign tasks, and monitor sprint milestone completion.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-11 rounded-xl bg-[#6C4CF1] px-5 text-sm font-bold text-white shadow-md shadow-[#6C4CF1]/20 hover:bg-[#5738D6]"
        >
          <Plus className="size-5" />
          <span>Create Project</span>
        </Button>
      </div>

      {/* 2. Controls: Search, Status filter, Sorting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E9E7F0] bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 size-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or objective..."
            className="h-10 w-full rounded-xl border border-[#E9E7F0] pl-10 pr-3.5 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-gray-100/80 p-1 text-xs font-bold text-gray-600">
            {(['All', 'In Progress', 'On Track', 'Completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 transition ${
                  statusFilter === status
                    ? 'bg-white text-[#6C4CF1] shadow-2xs font-extrabold'
                    : 'hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 rounded-xl border border-[#E9E7F0] bg-white px-3 text-xs font-semibold text-gray-700 outline-none hover:border-[#6C4CF1]"
          >
            <option value="progress">Highest Progress</option>
            <option value="name">Name (A-Z)</option>
            <option value="due">Target Due Date</option>
          </select>
        </div>
      </div>

      {/* 3. Projects Grid with stable min-height to prevent jumping */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 min-h-[500px] content-start">
        {filtered.map((project) => (
          <article
            key={project.id}
            className="group flex flex-col justify-between rounded-2xl border border-[#E9E7F0] bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#6C4CF1]/40 hover:shadow-md"
          >
            <div>
              {/* Header: Title & Options */}
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="min-w-0 flex-1 block"
                >
                  <h3 className="truncate text-lg font-bold text-[#1F2937] group-hover:text-[#6C4CF1] transition">
                    {project.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-[#6B7280]">
                    {project.description}
                  </p>
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                  >
                    <MoreVertical className="size-5" />
                  </button>

                  {menuOpenId === project.id && (
                    <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl z-20 animate-in fade-in zoom-in-95">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]"
                      >
                        <FolderKanban className="size-4 text-[#6C4CF1]" />
                        <span>Open Overview</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null)
                          handleDelete(project.id, project.title)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-[#6B7280]">Progress</span>
                  <span className="font-extrabold text-[#6C4CF1]">{project.progress}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#EC4899] transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Task Count & Status Badge */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckSquare2 className="size-3.5 text-gray-400" />
                  <span>{project.taskCount} tasks tracked</span>
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    project.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : project.status === 'On Track'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-purple-50 text-purple-700'
                  }`}
                >
                  {project.status}
                </span>
              </div>
            </div>

            {/* Bottom: Due date & Team Avatars */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs sm:text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-500">
                <Calendar className="size-4 text-gray-400" />
                <span>{project.dueDate}</span>
              </span>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {project.members.map((initials, idx) => (
                    <span
                      key={`${initials}-${idx}`}
                      className="grid size-7 place-items-center rounded-full border-2 border-white bg-indigo-50 text-[10px] font-bold text-[#6C4CF1] shadow-2xs"
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                {loading && <p className="py-12 text-center text-sm text-gray-500">Loading projects…</p>}
                {!loading && projects.length === 0 && (
                  <p className="py-12 text-center text-sm text-gray-500">No projects yet. Create one to get started.</p>
                )}

                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-[#6C4CF1] hover:bg-[#F7F5FF] transition"
                  title="View project details"
                >
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(p) => {
          setProjects((prev) => [p, ...prev])
          toast(`Project “${p.title}” created.`)
        }}
      />
    </div>
  )
}
