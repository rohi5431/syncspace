'use client'

import { useState } from 'react'
import { AlertCircle, Calendar, Check, CheckSquare2, Clock, Filter, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TaskSummary } from './dashboard-types'

export function MyTasks({
  tasks,
  onToggleTask,
  onCreateTask,
}: {
  tasks: TaskSummary[]
  onToggleTask: (taskId: string) => void
  onCreateTask: () => void
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all')

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === 'pending' && task.completed) return false
    if (statusFilter === 'completed' && !task.completed) return false
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    return true
  })

  const pendingCount = tasks.filter((t) => !t.completed).length
  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <section id="tasks" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937]">My Tasks & Overview</h2>
            <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-0.5 text-xs font-bold text-[#F59E0B]">
              {pendingCount} Pending
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
            Track your sprint deliverables, assigned tickets, and upcoming deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex rounded-xl bg-gray-100/80 p-1 text-xs font-bold text-gray-600">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-2.5 py-1.5 transition ${
                statusFilter === 'all' ? 'bg-white text-[#6C4CF1] shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`rounded-lg px-2.5 py-1.5 transition ${
                statusFilter === 'pending' ? 'bg-white text-[#6C4CF1] shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              To Do ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`rounded-lg px-2.5 py-1.5 transition ${
                statusFilter === 'completed' ? 'bg-white text-[#6C4CF1] shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="h-9 rounded-xl border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 outline-none hover:border-[#6C4CF1]"
          >
            <option value="all">All Priorities</option>
            <option value="High">🔥 High</option>
            <option value="Medium">⚡ Medium</option>
            <option value="Low">🌱 Low</option>
          </select>

          <Button
            type="button"
            onClick={onCreateTask}
            className="h-9 rounded-xl bg-[#6C4CF1] px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-[#5738D6]"
          >
            <Plus className="size-4" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="mt-5 divide-y divide-gray-100">
        {filteredTasks.map((task) => {
          const isOverdue = task.title.toLowerCase().includes('critical') && !task.completed
          return (
            <div
              key={task.id}
              className={`group flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center rounded-xl px-3 transition ${
                task.completed ? 'bg-gray-50/50' : 'hover:bg-[#F7F5FF]/50'
              }`}
            >
              {/* Left: Checkbox + Title + Project */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  title={task.completed ? 'Mark pending' : 'Mark completed'}
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
                    className={`text-sm font-bold truncate transition ${
                      task.completed ? 'text-gray-400 line-through' : 'text-[#1F2937]'
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-[#6C4CF1]">
                      {task.projectName}
                    </span>
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                        <AlertCircle className="size-3" />
                        <span>Overdue</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Priority, Due Date, Assignee */}
              <div className="flex items-center gap-3 sm:justify-end">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                    task.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                      : task.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200/50'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {task.priority} Priority
                </span>

                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <Calendar className="size-3.5 text-gray-400" />
                  <span>{task.dueDate}</span>
                </div>

                <div
                  className="grid size-7 place-items-center rounded-full bg-indigo-100 text-[10px] font-bold text-[#6C4CF1] shadow-2xs"
                  title={`Assigned to ${task.assignee.name}`}
                >
                  {task.assignee.initials}
                </div>
              </div>
            </div>
          )
        })}

        {filteredTasks.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            <CheckSquare2 className="mx-auto size-8 text-gray-300" />
            <p className="mt-2 font-bold text-gray-700">No tasks in this filter view</p>
            <p className="text-xs text-gray-400">All deliverables under this category are completed.</p>
          </div>
        )}
      </div>
    </section>
  )
}
