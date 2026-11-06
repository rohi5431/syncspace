'use client'

import { CalendarDays, FolderKanban, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectSummary } from './dashboard-types'

export function ProjectOverview({
  projects,
  onOpenProject,
  onCreateProject,
}: {
  projects: ProjectSummary[]
  onOpenProject: (proj: ProjectSummary) => void
  onCreateProject: () => void
}) {
  return (
    <section id="projects" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937]">Active Projects</h2>
            <span className="rounded-full bg-[#EC4899]/10 px-2.5 py-0.5 text-xs font-bold text-[#EC4899]">
              {projects.length} Initiatives
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
            Track progress against team deliverables, sprint velocity, and target ship dates.
          </p>
        </div>

        <Button
          type="button"
          onClick={onCreateProject}
          className="h-9 sm:h-10 rounded-xl bg-[#6C4CF1] px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-[#5738D6]"
        >
          <Plus className="size-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-[#F7F5FF]/40 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#6C4CF1]/40 hover:bg-white hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpenProject(project)}
                  className="min-w-0 text-left flex-1"
                >
                  <h3 className="truncate text-base font-bold text-[#1F2937] transition group-hover:text-[#6C4CF1]">
                    {project.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#6B7280]">
                    {project.description}
                  </p>
                </button>
                <span
                  className={`mt-1 size-3 shrink-0 rounded-full ${
                    project.progress === 100
                      ? 'bg-[#16A34A]'
                      : project.tone === 'emerald'
                      ? 'bg-[#16A34A]'
                      : project.tone === 'amber'
                      ? 'bg-[#F59E0B]'
                      : project.tone === 'pink'
                      ? 'bg-[#EC4899]'
                      : 'bg-[#6C4CF1]'
                  }`}
                  aria-label={`${project.status} status`}
                />
              </div>

              {/* Progress Bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#6B7280]">Completion</span>
                  <span className="font-extrabold text-[#6C4CF1]">{project.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#EC4899] transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom: Due Date & Member Avatars */}
            <div className="mt-5 flex items-center justify-between border-t border-gray-100/80 pt-3 text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-500">
                <CalendarDays className="size-3.5 text-gray-400" />
                <span>{project.dueDate}</span>
              </span>

              <div className="flex -space-x-1.5">
                {project.members.map((initials, idx) => (
                  <span
                    key={`${initials}-${idx}`}
                    className="grid size-6 place-items-center rounded-full border-2 border-white bg-indigo-100 text-[10px] font-bold text-[#6C4CF1] shadow-2xs"
                    title={`Member ${initials}`}
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
  )
}
