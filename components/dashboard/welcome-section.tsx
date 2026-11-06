'use client'

import { useMemo } from 'react'
import { Calendar, FolderKanban, Plus, Sparkles, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WelcomeSection({
  userName = 'Rohit',
  workspaceName = 'Northstar Studio',
  planName = 'Pro Plan',
  onCreateDocument,
  onCreateProject,
  onInviteMember,
}: {
  userName?: string
  workspaceName?: string
  planName?: string
  onCreateDocument: () => void
  onCreateProject: () => void
  onInviteMember: () => void
}) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date())
  }, [])

  return (
    <section aria-label="Personalized welcome" className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-white px-3 py-1 text-xs font-bold text-[#6C4CF1] shadow-2xs">
            <span className="size-2 rounded-full bg-[#6C4CF1]" />
            <span>{workspaceName}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <Sparkles className="size-3" />
            <span>{planName}</span>
          </span>
          <span className="text-xs font-semibold text-gray-500">·</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
            <Calendar className="size-3.5 text-gray-400" />
            <span>{formattedDate}</span>
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1F2937] sm:text-4xl lg:text-[42px]">
          {greeting}, {userName} <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="mt-2 text-base sm:text-lg text-[#6B7280]">
          Here&apos;s a live overview of what&apos;s happening in your workspace today.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onInviteMember}
          className="h-11 sm:h-12 rounded-xl border-[#E9E7F0] bg-white px-4 sm:px-5 text-sm sm:text-base font-semibold text-gray-700 shadow-2xs hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
        >
          <UserPlus className="size-4.5 text-gray-500" />
          <span>Invite Member</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCreateProject}
          className="h-11 sm:h-12 rounded-xl border-[#E9E7F0] bg-white px-4 sm:px-5 text-sm sm:text-base font-semibold text-gray-700 shadow-2xs hover:bg-[#F7F5FF] hover:text-[#6C4CF1] transition"
        >
          <FolderKanban className="size-4.5 text-gray-500" />
          <span>New Project</span>
        </Button>
        <Button
          type="button"
          onClick={onCreateDocument}
          className="h-11 sm:h-12 rounded-xl bg-[#6C4CF1] px-5 sm:px-6 text-sm sm:text-base font-bold text-white shadow-md shadow-[#6C4CF1]/20 hover:bg-[#5738D6] transition"
        >
          <Plus className="size-5" />
          <span>Create Document</span>
        </Button>
      </div>
    </section>
  )
}
