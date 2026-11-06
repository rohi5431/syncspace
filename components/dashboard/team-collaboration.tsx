'use client'

import { MessageSquare, Plus, Sparkles, UserPlus, Users2 } from 'lucide-react'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import type { TeamMemberSummary } from './dashboard-types'

export function TeamCollaboration({
  teamMembers,
  onInviteMember,
}: {
  teamMembers: TeamMemberSummary[]
  onInviteMember: () => void
}) {
  const toast = useToast()
  const onlineCount = teamMembers.filter((m) => m.online).length

  const handlePing = (name: string) => {
    toast(`Sent direct notification to ${name}.`)
  }

  return (
    <section id="team" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-7 shadow-xs scroll-mt-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937]">Team Collaboration</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{onlineCount} Online</span>
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#6B7280]">Real-time presence across your active workspace.</p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onInviteMember}
          className="h-9 rounded-xl border-[#E9E7F0] px-3 text-xs font-bold text-[#6C4CF1] hover:bg-[#F7F5FF]"
        >
          <UserPlus className="size-3.5" />
          <span>Invite</span>
        </Button>
      </div>

      {/* Members List */}
      <div className="mt-4 divide-y divide-gray-100">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 py-3 rounded-xl px-2 hover:bg-[#F7F5FF]/50 transition"
          >
            {/* Left: Avatar + Details */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <UserAvatar initials={member.initials} name={member.name} tone={member.tone} size="md" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${
                    member.online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                  }`}
                  title={member.online ? 'Online now' : 'Offline'}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-[#1F2937]">{member.name}</p>
                  <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                    {member.role}
                  </span>
                </div>
                <p className="truncate text-xs text-gray-400">{member.email}</p>
              </div>
            </div>

            {/* Right: Presence Status + Ping button */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-semibold ${
                  member.online ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {member.online ? 'Active now' : member.lastActive}
              </span>
              <button
                type="button"
                onClick={() => handlePing(member.name)}
                title={`Ping ${member.name}`}
                className="grid size-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#6C4CF1] hover:text-[#6C4CF1] transition"
              >
                <MessageSquare className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
