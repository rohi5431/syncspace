'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckSquare2,
  Clock,
  FolderKanban,
  Plus,
  Settings,
  Sparkles,
  Users2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { useToast } from '@/components/providers/toast-provider'
import { apiFetch } from '@/lib/api-client'
import { CreateDocumentDialog, CreateTaskDialog } from '@/components/dashboard/create-dialogs'
import type { DocumentSummary, ProjectSummary, TaskSummary, TeamMemberSummary } from '@/components/dashboard/dashboard-types'

interface ProjectDetailProps {
  projectId: string
}

interface ProjectRecord extends ProjectSummary {
  sections: Array<{ key: string; title: string }>
  documents: Array<{ id: string; title: string; type: string; updatedAt: string }>
  createdAt: string
  updatedAt: string
}

type ProjectWithTasks = ProjectRecord & {
  tasks: Array<{
    id: string
    title: string
    completed: boolean
    dueDate: string | null
    assignedTo: string | null
    priority: string
  }>
}

export function ProjectDetailView({ projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<ProjectRecord | null>(null)
  const [tasks, setTasks] = useState<TaskSummary[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMemberSummary[]>([])
  const [activeSection, setActiveSection] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(() => new Set())
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false)
  const toast = useToast()

  useEffect(() => {
    let active = true
    Promise.all([
      apiFetch(`/api/projects/${encodeURIComponent(projectId)}`),
      apiFetch('/api/dashboard/summary'),
    ])
      .then(async ([projectResponse, summaryResponse]) => {
        if (!projectResponse.ok) throw new Error(await projectResponse.text() || 'Unable to load project')
        if (!summaryResponse.ok) throw new Error(await summaryResponse.text() || 'Unable to load workspace members')
        return Promise.all([projectResponse.json(), summaryResponse.json()])
      })
      .then(([record, summary]: [ProjectWithTasks, { teamMembers?: TeamMemberSummary[] }]) => {
        if (!active) return
        const members = summary.teamMembers ?? []
        setProject(record)
        setTeamMembers(members)
        setTasks(record.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          projectName: record.title,
          projectTone: record.tone,
          completed: task.completed,
          dueDate: task.dueDate ?? 'No due date',
          priority: task.priority === 'HIGH' ? 'High' : task.priority === 'LOW' ? 'Low' : 'Medium',
          assignee: {
            name: members.find((member) => member.id === task.assignedTo)?.name ?? 'Unassigned',
            initials: members.find((member) => member.id === task.assignedTo)?.initials ?? '--',
          },
        })))
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load project')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [projectId])

  const completedCount = tasks.filter((t) => t.completed).length
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : project?.progress ?? 0

  const toggleTask = async (id: string) => {
    const task = tasks.find((item) => item.id === id)
    if (!task || updatingTaskIds.has(id)) return
    const completed = !task.completed
    setUpdatingTaskIds((previous) => new Set(previous).add(id))
    setTasks((previous) => previous.map((item) => item.id === id ? { ...item, completed } : item))
    try {
      const response = await apiFetch(`/api/tasks/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to update task')
    } catch (error) {
      setTasks((previous) => previous.map((item) => item.id === id ? { ...item, completed: task.completed } : item))
      toast(error instanceof Error ? error.message : 'Unable to update task')
    } finally {
      setUpdatingTaskIds((previous) => {
        const next = new Set(previous)
        next.delete(id)
        return next
      })
    }
  }

  const handleCreateTask = (task: TaskSummary) => {
    setTasks((prev) => [task, ...prev])
    toast(`“${task.title}” added to project.`)
  }

  const updateProject = async (updates: Partial<ProjectRecord>) => {
    try {
      const response = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to save project')
      const saved = await response.json()
      setProject((previous) => previous ? { ...previous, ...saved } : previous)
      toast('Project settings saved.')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to save project')
    }
  }

  if (loading) return <p className="py-16 text-center text-sm text-gray-500">Loading project…</p>
  if (!project) return <p role="alert" className="py-16 text-center text-sm text-red-600">{loadError || 'Project not found.'}</p>

  return (
    <div className="space-y-8">
      {/* Top breadcrumb navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500 hover:text-[#6C4CF1] transition"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Header Banner */}
      <div className="rounded-3xl border border-[#E9E7F0] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-[#6C4CF1]">
                Project #{projectId}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              {project.progress >= 100 ? 'Completed' : 'In Progress'}
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                <Calendar className="size-3.5 text-gray-400" />
                <span>Target: {project.dueDate}</span>
              </span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
              {project.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-[#6B7280]">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => setCreateTaskOpen(true)}
              className="h-11 rounded-xl bg-[#6C4CF1] px-5 text-sm font-bold text-white shadow-md shadow-[#6C4CF1]/20 hover:bg-[#5738D6]"
            >
              <Plus className="size-4.5" />
              <span>Add Task</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar & Metrics */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-[#6B7280]">Overall Sprint Progress</span>
            <span className="font-extrabold text-[#6C4CF1]">
              {progressPercent}% ({completedCount} of {tasks.length} tasks completed)
            </span>
          </div>
          <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#EC4899] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <nav aria-label="Project sections" className="flex gap-2 overflow-x-auto rounded-2xl border border-[#E9E7F0] bg-white p-2">
        {(project.sections.length ? project.sections : [
          { key: 'overview', title: 'Overview' },
          { key: 'documents', title: 'Documents' },
          { key: 'tasks', title: 'Tasks' },
          { key: 'kanban', title: 'Kanban Board' },
          { key: 'team', title: 'Team Members' },
          { key: 'activity', title: 'Activity Feed' },
          { key: 'settings', title: 'Project Settings' },
        ]).map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveSection(section.key)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeSection === section.key ? 'bg-[#6C4CF1] text-white' : 'text-gray-600 hover:bg-[#F7F5FF]'
            }`}
          >
            {section.title}
          </button>
        ))}
      </nav>

      {activeSection === 'overview' ? (
      /* Main Grid: Tasks Checklist + Team & Activity */
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: Tasks List */}
        <div className="rounded-2xl border border-[#E9E7F0] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">Project Tasks & Deliverables</h2>
              <p className="text-xs text-gray-500">Check off items as work progresses.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateTaskOpen(true)}
              className="h-9 px-3 rounded-xl border-gray-200 text-xs font-bold"
            >
              <Plus className="size-3.5" />
              <span>New Task</span>
            </Button>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 py-3.5 hover:bg-[#F7F5FF]/50 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    disabled={updatingTaskIds.has(task.id)}
                    aria-label={`Mark task ${task.title} ${task.completed ? 'incomplete' : 'complete'}`}
                    aria-pressed={task.completed}
                    className={`grid size-6 shrink-0 place-items-center rounded-lg border transition ${
                      task.completed
                        ? 'border-[#16A34A] bg-[#16A34A] text-white'
                        : 'border-gray-300 bg-white hover:border-[#6C4CF1]'
                    }`}
                  >
                    {task.completed && <Check className="size-4" />}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold truncate ${
                        task.completed ? 'text-gray-400 line-through' : 'text-[#1F2937]'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-semibold text-gray-600">Assigned: {task.assignee.name}</span>
                      <span>·</span>
                      <span>Due {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    task.priority === 'High'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Team & Activity */}
        <div className="space-y-6">
          {/* Team Assigned */}
          <div className="rounded-2xl border border-[#E9E7F0] bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#1F2937] border-b border-gray-100 pb-3">
              Team Members
            </h2>
            <div className="mt-4 space-y-3">
              {project.members.map((initials) => (
                <div key={initials} className="flex items-center gap-3">
                  <UserAvatar initials={initials} name={initials} tone="indigo" size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1F2937]">{initials}</p>
                    <p className="text-xs text-gray-500">Project member</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Activity */}
          <div className="rounded-2xl border border-[#E9E7F0] bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#1F2937] border-b border-gray-100 pb-3">
              Project Timeline
            </h2>
            <div className="mt-4 space-y-3 text-xs text-gray-600">
              <p>Project created {new Date(project.createdAt).toLocaleString()}.</p>
              <p>Last updated {new Date(project.updatedAt).toLocaleString()}.</p>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <ProjectSection
          section={activeSection}
          project={project}
          tasks={tasks}
          onSave={updateProject}
          onToggleTask={toggleTask}
          onCreateDocument={() => setCreateDocumentOpen(true)}
        />
      )}

      <CreateTaskDialog
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onCreate={handleCreateTask}
        projectId={projectId}
        projects={project ? [project] : []}
        teamMembers={teamMembers}
      />
      <CreateDocumentDialog
        open={createDocumentOpen}
        onClose={() => setCreateDocumentOpen(false)}
        projectId={projectId}
        onCreate={(document: DocumentSummary) => {
          setProject((previous) => previous ? {
            ...previous,
            documents: [{
              id: document.id,
              title: document.title,
              type: document.type ?? 'TECHNICAL_DOCUMENTATION',
              updatedAt: document.updatedAt,
            }, ...previous.documents],
          } : previous)
        }}
      />
    </div>
  )
}

function ProjectSection({
  section,
  project,
  tasks,
  onSave,
  onToggleTask,
  onCreateDocument,
}: {
  section: string
  project: ProjectRecord
  tasks: TaskSummary[]
  onSave: (updates: Partial<ProjectRecord>) => Promise<void>
  onToggleTask: (id: string) => Promise<void>
  onCreateDocument: () => void
}) {
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [dueDate, setDueDate] = useState(project.dueDate)
  const [template, setTemplate] = useState(project.template ?? 'web-application-development')
  const [members, setMembers] = useState(project.members.join(', '))

  useEffect(() => {
    setTitle(project.title)
    setDescription(project.description)
    setDueDate(project.dueDate)
    setTemplate(project.template ?? 'web-application-development')
    setMembers(project.members.join(', '))
  }, [project])

  const panelClass = 'rounded-2xl border border-[#E9E7F0] bg-white p-6 shadow-xs'
  if (section === 'documents') {
    return (
      <section className={panelClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Project documents</h2>
            <p className="mt-1 text-sm text-gray-500">Specifications, design docs, and project notes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/documents" className="text-sm font-semibold text-indigo-600">Open documents</Link>
            <Button type="button" onClick={onCreateDocument} className="rounded-xl bg-[#6C4CF1] text-white">New document</Button>
          </div>
        </div>
        <div className="mt-4 divide-y divide-gray-100">
          {project.documents.map((document) => (
            <Link key={document.id} href="/dashboard/documents" className="flex items-center justify-between gap-3 py-3 text-sm hover:text-indigo-600">
              <span className="font-semibold">{document.title}</span>
              <span className="text-xs text-gray-500">{document.type}</span>
            </Link>
          ))}
          {project.documents.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No documents are linked to this project yet.</p>}
        </div>
      </section>
    )
  }

  if (section === 'tasks') {
    return (
      <section className={panelClass}>
        <h2 className="text-lg font-bold text-gray-900">Project tasks</h2>
        <div className="mt-4 divide-y divide-gray-100">
          {tasks.map((task) => (
            <label key={task.id} className="flex items-center gap-3 py-3 text-sm">
              <input type="checkbox" checked={task.completed} onChange={() => void onToggleTask(task.id)} />
              <span className={task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}>{task.title}</span>
              <span className="ml-auto text-xs text-gray-500">{task.dueDate}</span>
            </label>
          ))}
          {tasks.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No tasks yet.</p>}
        </div>
      </section>
    )
  }

  if (section === 'kanban') {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: 'To do', completed: false },
          { title: 'Done', completed: true },
        ].map((column) => (
          <section key={column.title} className={panelClass}>
            <h2 className="font-bold text-gray-900">{column.title}</h2>
            <div className="mt-3 space-y-2">
              {tasks.filter((task) => task.completed === column.completed).map((task) => (
                <button key={task.id} type="button" onClick={() => void onToggleTask(task.id)} className="block w-full rounded-xl border border-gray-100 p-3 text-left text-sm font-medium hover:border-indigo-200">
                  {task.title}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    )
  }

  if (section === 'team') {
    return (
      <section className={panelClass}>
        <h2 className="text-lg font-bold text-gray-900">Project members</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {project.members.map((initials) => (
            <div key={initials} className="flex items-center gap-2 rounded-xl border border-gray-100 px-3 py-2">
              <UserAvatar initials={initials} name={initials} size="sm" />
              <span className="text-sm font-semibold text-gray-700">{initials}</span>
            </div>
          ))}
          {project.members.length === 0 && <p className="text-sm text-gray-500">No project members assigned.</p>}
        </div>
      </section>
    )
  }

  if (section === 'activity') {
    return (
      <section className={panelClass}>
        <h2 className="text-lg font-bold text-gray-900">Project activity</h2>
        <ol className="mt-4 space-y-3 text-sm text-gray-600">
          <li>Project created · {new Date(project.createdAt).toLocaleString()}</li>
          <li>Project last updated · {new Date(project.updatedAt).toLocaleString()}</li>
          {tasks.map((task) => <li key={task.id}>Task {task.completed ? 'completed' : 'tracked'} · {task.title}</li>)}
        </ol>
      </section>
    )
  }

  return (
    <form
      className={`${panelClass} space-y-4`}
      onSubmit={(event) => {
        event.preventDefault()
        void onSave({
          title: title.trim(),
          description: description.trim(),
          dueDate: dueDate.trim() || 'No due date',
          template,
          members: members.split(',').map((member) => member.trim()).filter(Boolean),
        })
      }}
    >
      <h2 className="text-lg font-bold text-gray-900">Project settings</h2>
      <label className="block text-sm font-semibold text-gray-700">
        Project name
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 font-normal" required />
      </label>
      <label className="block text-sm font-semibold text-gray-700">
        Description
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-200 p-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-gray-700">
        Due date
        <input value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold text-gray-700">
        Template
        <select value={template} onChange={(event) => setTemplate(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 font-normal">
          <option value="web-application-development">Web Application Development</option>
          <option value="full-stack-development">Full-Stack Development</option>
          <option value="backend-engineering">Backend Engineering</option>
          <option value="ai-ml-projects">AI/ML Projects</option>
          <option value="mobile-application-development">Mobile Application Development</option>
          <option value="devops-and-ci-cd">DevOps and CI/CD</option>
          <option value="database-engineering">Database Engineering</option>
          <option value="system-design-projects">System Design Projects</option>
        </select>
      </label>
      <label className="block text-sm font-semibold text-gray-700">
        Member initials, separated by commas
        <input value={members} onChange={(event) => setMembers(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 font-normal" />
      </label>
      <Button type="submit" className="rounded-xl bg-[#6C4CF1] text-white">Save settings</Button>
    </form>
  )
}
