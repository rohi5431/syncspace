'use client'

import { CheckSquare2, FilePlus, FolderKanban, Kanban, UserPlus, Users2 } from 'lucide-react'

export function QuickActions({
  onCreateDocument,
  onCreateProject,
  onCreateTask,
  onInviteMember,
  onCreateBoard,
  onViewTeam,
}: {
  onCreateDocument: () => void
  onCreateProject: () => void
  onCreateTask: () => void
  onInviteMember: () => void
  onCreateBoard: () => void
  onViewTeam: () => void
}) {
  const actions = [
    {
      title: 'Create Document',
      desc: 'Collaborative real-time docs',
      icon: FilePlus,
      color: 'text-[#6C4CF1]',
      bg: 'bg-[#6C4CF1]/10',
      hoverBorder: 'hover:border-[#6C4CF1]',
      onClick: onCreateDocument,
    },
    {
      title: 'Create Project',
      desc: 'Plan sprints & team milestones',
      icon: FolderKanban,
      color: 'text-[#EC4899]',
      bg: 'bg-[#EC4899]/10',
      hoverBorder: 'hover:border-[#EC4899]',
      onClick: onCreateProject,
    },
    {
      title: 'Create Task',
      desc: 'Assign deliverables & due dates',
      icon: CheckSquare2,
      color: 'text-[#16A34A]',
      bg: 'bg-[#16A34A]/10',
      hoverBorder: 'hover:border-[#16A34A]',
      onClick: onCreateTask,
    },
    {
      title: 'Invite Member',
      desc: 'Add teammates to workspace',
      icon: UserPlus,
      color: 'text-[#3B82F6]',
      bg: 'bg-[#3B82F6]/10',
      hoverBorder: 'hover:border-[#3B82F6]',
      onClick: onInviteMember,
    },
    {
      title: 'Kanban Board',
      desc: 'Visualize agile workflow stages',
      icon: Kanban,
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#8B5CF6]/10',
      hoverBorder: 'hover:border-[#8B5CF6]',
      onClick: onCreateBoard,
    },
    {
      title: 'View Team',
      desc: 'Member directory & live presence',
      icon: Users2,
      color: 'text-[#059669]',
      bg: 'bg-[#059669]/10',
      hoverBorder: 'hover:border-[#059669]',
      onClick: onViewTeam,
    },
  ]

  return (
    <section aria-label="Quick actions" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937]">Quick Actions</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[#6B7280]">
            Frequently used workspace actions and resource creation shortcuts.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <button
              key={act.title}
              type="button"
              onClick={act.onClick}
              className={`group flex flex-col items-center rounded-2xl border border-gray-100 bg-[#F7F5FF]/60 p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-md ${act.hoverBorder}`}
            >
              <span
                className={`grid size-12 place-items-center rounded-2xl transition duration-200 group-hover:scale-110 ${act.bg} ${act.color}`}
              >
                <Icon className="size-6" />
              </span>
              <p className="mt-3 text-xs sm:text-sm font-bold text-[#1F2937] group-hover:text-[#6C4CF1] transition">
                {act.title}
              </p>
              <p className="mt-1 line-clamp-1 text-[11px] text-[#6B7280]">{act.desc}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
