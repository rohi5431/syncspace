'use client'

import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  CheckSquare2,
  ChevronDown,
  Columns3,
  Filter,
  Kanban,
  List,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { useToast } from '@/components/providers/toast-provider'
import { CreateTaskDialog } from '@/components/dashboard/create-dialogs'
import type { TaskSummary } from '@/components/dashboard/dashboard-types'

export interface ExtendedTask extends TaskSummary {
  status: 'To Do' | 'In Progress' | 'In Review' | 'Completed'
  description?: string
  priority: 'High' | 'Medium' | 'Low'
}

const initialTasks: ExtendedTask[] = [
  {
    id: 't-1',
    title: 'Audit Redis pub/sub queue latency under 10k connections',
    projectName: 'Realtime Infrastructure',
    projectTone: 'amber',
    completed: false,
    status: 'In Progress',
    dueDate: 'Nov 7',
    priority: 'High',
    assignee: { name: 'Jordan Lee', initials: 'JL' },
    description: 'Ensure websocket broadcast delay does not exceed 30ms under concurrent room messaging.',
  },
  {
    id: 't-2',
    title: 'Implement collapsible sidebar with rail mode and tooltips',
    projectName: 'Website refresh',
    projectTone: 'indigo',
    completed: true,
    status: 'Completed',
    dueDate: 'Nov 6',
    priority: 'High',
    assignee: { name: 'Rohit Kumar', initials: 'RK' },
    description: 'Allow toggling between 288px full sidebar and 78px compact rail.',
  },
  {
    id: 't-3',
    title: 'Configure JWT session cookies and proxy rewrite in next.config.mjs',
    projectName: 'Website refresh',
    projectTone: 'indigo',
    completed: true,
    status: 'Completed',
    dueDate: 'Nov 6',
    priority: 'Medium',
    assignee: { name: 'Rohit Kumar', initials: 'RK' },
    description: 'Secure session persistence and backend routing.',
  },
  {
    id: 't-4',
    title: 'Update dark/light design tokens for soft lavender palette',
    projectName: 'Website refresh',
    projectTone: 'indigo',
    completed: false,
    status: 'In Review',
    dueDate: 'Nov 9',
    priority: 'Medium',
    assignee: { name: 'Maya Chen', initials: 'MC' },
    description: 'Align color variables with lavender #F7F5FF and primary purple #6C4CF1.',
  },
  {
    id: 't-5',
    title: 'Profile WebSocket reconnection backoff on packet drop',
    projectName: 'Realtime Infrastructure',
    projectTone: 'amber',
    completed: false,
    status: 'To Do',
    dueDate: 'Nov 11',
    priority: 'High',
    assignee: { name: 'Jordan Lee', initials: 'JL' },
    description: 'Verify exponential retry backoff behavior.',
  },
  {
    id: 't-6',
    title: 'Review customer feedback on document commenting feature',
    projectName: 'Mobile app v2',
    projectTone: 'emerald',
    completed: false,
    status: 'To Do',
    dueDate: 'Nov 14',
    priority: 'Low',
    assignee: { name: 'Aisha Shah', initials: 'AS' },
    description: 'Collate interviews and survey responses.',
  },
]

export function TasksManager() {
  const [tasks, setTasks] = useState<ExtendedTask[]>(initialTasks)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('kanban')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [createOpen, setCreateOpen] = useState(false)
  const toast = useToast()

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter !== 'All' && task.status !== statusFilter) return false
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          task.title.toLowerCase().includes(q) ||
          task.projectName.toLowerCase().includes(q) ||
          task.assignee.name.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [tasks, statusFilter, priorityFilter, search])

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'Completed' : 'In Progress',
          }
        }
        return t
      }),
    )
  }

  const changeStatus = (id: string, newStatus: ExtendedTask['status']) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: newStatus,
              completed: newStatus === 'Completed',
            }
          : t,
      ),
    )
    toast(`Task status moved to ${newStatus}.`)
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    toast('Task deleted.')
  }

  const handleCreate = (task: TaskSummary) => {
    const extended: ExtendedTask = {
      ...task,
      status: 'To Do',
    }
    setTasks((prev) => [extended, ...prev])
    toast(`Task “${task.title}” created.`)
  }

  const kanbanColumns: ExtendedTask['status'][] = ['To Do', 'In Progress', 'In Review', 'Completed']

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#E9E7F0] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
              Task Management
            </h1>
            <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-0.5 text-xs font-bold text-[#F59E0B]">
              {tasks.filter((t) => !t.completed).length} Pending
            </span>
          </div>
          <p className="mt-1 text-sm sm:text-base text-[#6B7280]">
            Organize work with List, Kanban, and Calendar views.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View switcher */}
          <div className="flex rounded-xl border border-[#E9E7F0] bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'list' ? 'bg-[#6C4CF1] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="size-4" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'kanban' ? 'bg-[#6C4CF1] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Columns3 className="size-4" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'calendar' ? 'bg-[#6C4CF1] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="size-4" />
              <span>Calendar</span>
            </button>
          </div>

          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-11 rounded-xl bg-[#6C4CF1] px-5 text-sm font-bold text-white shadow-md shadow-[#6C4CF1]/20 hover:bg-[#5738D6]"
          >
            <Plus className="size-5" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* 2. Controls: Search, Status filter, Priority filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E9E7F0] bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 size-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, projects, or assignees..."
            className="h-10 w-full rounded-xl border border-[#E9E7F0] pl-10 pr-3.5 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-[#E9E7F0] bg-white px-3 text-xs font-semibold text-gray-700 outline-none hover:border-[#6C4CF1]"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-10 rounded-xl border border-[#E9E7F0] bg-white px-3 text-xs font-semibold text-gray-700 outline-none hover:border-[#6C4CF1]"
          >
            <option value="All">All Priorities</option>
            <option value="High">🔥 High</option>
            <option value="Medium">⚡ Medium</option>
            <option value="Low">🌱 Low</option>
          </select>
        </div>
      </div>

      {/* 3. VIEW RENDERERS WITH STABLE MIN-HEIGHT */}
      <div className="min-h-[540px]">
      {viewMode === 'kanban' && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-start">
          {kanbanColumns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col)
            return (
              <div key={col} className="rounded-2xl border border-[#E9E7F0] bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[#1F2937] text-sm">{col}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="rounded-lg p-1 text-gray-400 hover:text-[#6C4CF1] hover:bg-[#F7F5FF]"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group rounded-xl border border-gray-100 bg-[#F7F5FF]/50 p-4 transition-all hover:bg-white hover:border-[#6C4CF1]/40 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-[#6C4CF1]">
                          {task.projectName}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                            task.priority === 'High'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="mt-2.5 font-bold text-sm text-[#1F2937] line-clamp-2">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-gray-200/50 pt-3 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <CalendarIcon className="size-3.5" />
                          <span>{task.dueDate}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className="grid size-6 place-items-center rounded-full bg-indigo-100 text-[10px] font-bold text-[#6C4CF1]"
                            title={task.assignee.name}
                          >
                            {task.assignee.initials}
                          </div>

                          {/* Move column quick selector */}
                          <select
                            value={task.status}
                            onChange={(e) => changeStatus(task.id, e.target.value as any)}
                            className="text-[10px] font-bold bg-white border border-gray-200 rounded px-1 py-0.5 outline-none cursor-pointer"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="In Review">In Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      No tasks in this stage
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-2xl border border-[#E9E7F0] bg-white shadow-xs">
          <div className="divide-y divide-gray-100">
            {filtered.map((task) => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-[#F7F5FF]/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
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
                      className={`text-sm sm:text-base font-bold truncate ${
                        task.completed ? 'text-gray-400 line-through' : 'text-[#1F2937]'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-semibold text-[#6C4CF1]">{task.projectName}</span>
                      <span>·</span>
                      <span>Assigned to {task.assignee.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <select
                    value={task.status}
                    onChange={(e) => changeStatus(task.id, e.target.value as any)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700 outline-none"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      task.priority === 'High'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span className="text-xs font-medium text-gray-500 min-w-16 text-right">
                    {task.dueDate}
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="rounded-2xl border border-[#E9E7F0] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-[#1F2937]">November 2026 Deliverables Schedule</h2>
            <span className="text-xs font-bold text-[#6C4CF1]">Sprint Cadence: 2-Week Iterations</span>
          </div>

          <div className="space-y-4">
            {filtered.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#F7F5FF]/40 p-4 hover:bg-[#F7F5FF] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-white border border-gray-200 font-extrabold text-xs text-[#6C4CF1]">
                    {task.dueDate}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1F2937]">{task.title}</h4>
                    <p className="text-xs text-gray-500">{task.projectName} · {task.assignee.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-[#6C4CF1]">
                    {task.status}
                  </span>
                  <span className="text-xs font-bold text-gray-600">{task.priority} Priority</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      <CreateTaskDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
