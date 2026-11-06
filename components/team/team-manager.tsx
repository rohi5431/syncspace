'use client'

import { useMemo, useState } from 'react'
import {
  Check,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { useToast } from '@/components/providers/toast-provider'
import { InviteMemberDialog } from '@/components/dashboard/create-dialogs'
import type { TeamMemberSummary } from '@/components/dashboard/dashboard-types'

export interface ExtendedTeamMember extends TeamMemberSummary {
  joinedDate: string
  status: 'active' | 'pending'
}

const initialTeam: ExtendedTeamMember[] = [
  {
    id: 'm-1',
    name: 'Rohit Kumar',
    email: 'rohit@northstar.co',
    initials: 'RK',
    role: 'Owner',
    tone: 'slate',
    online: true,
    lastActive: 'Active now',
    joinedDate: 'Oct 1, 2026',
    status: 'active',
  },
  {
    id: 'm-2',
    name: 'Maya Chen',
    email: 'maya@northstar.co',
    initials: 'MC',
    role: 'Admin',
    tone: 'indigo',
    online: true,
    lastActive: 'Active now',
    joinedDate: 'Oct 5, 2026',
    status: 'active',
  },
  {
    id: 'm-3',
    name: 'Jordan Lee',
    email: 'jordan@northstar.co',
    initials: 'JL',
    role: 'Admin',
    tone: 'emerald',
    online: true,
    lastActive: 'Active now',
    joinedDate: 'Oct 12, 2026',
    status: 'active',
  },
  {
    id: 'm-4',
    name: 'Aisha Shah',
    email: 'aisha@northstar.co',
    initials: 'AS',
    role: 'Member',
    tone: 'amber',
    online: false,
    lastActive: '3 hours ago',
    joinedDate: 'Oct 18, 2026',
    status: 'active',
  },
  {
    id: 'm-5',
    name: 'Elena Rostova',
    email: 'elena@northstar.co',
    initials: 'ER',
    role: 'Member',
    tone: 'pink',
    online: false,
    lastActive: 'Yesterday',
    joinedDate: 'Nov 1, 2026',
    status: 'active',
  },
  {
    id: 'm-6',
    name: 'Marcus Vance',
    email: 'marcus@partner.org',
    initials: 'MV',
    role: 'Member',
    tone: 'indigo',
    online: false,
    lastActive: 'Invited 2 days ago',
    joinedDate: 'Nov 4, 2026',
    status: 'pending',
  },
]

export function TeamManager() {
  const [members, setMembers] = useState<ExtendedTeamMember[]>(initialTeam)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'Owner' | 'Admin' | 'Member'>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Online' | 'Offline' | 'Pending'>('All')
  const [inviteOpen, setInviteOpen] = useState(false)
  const toast = useToast()

  const onlineCount = members.filter((m) => m.online).length
  const pendingCount = members.filter((m) => m.status === 'pending').length
  const adminCount = members.filter((m) => m.role === 'Admin' || m.role === 'Owner').length

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter !== 'All' && m.role !== roleFilter) return false
      if (statusFilter === 'Online' && !m.online) return false
      if (statusFilter === 'Offline' && (m.online || m.status === 'pending')) return false
      if (statusFilter === 'Pending' && m.status !== 'pending') return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      }
      return true
    })
  }, [members, roleFilter, statusFilter, search])

  const handleRoleChange = (id: string, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)),
    )
    toast(`Updated role to ${newRole}.`)
  }

  const handleRemove = (id: string, name: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    toast(`Removed ${name} from workspace.`)
  }

  const handleInvite = (email: string, role: string) => {
    const initials = email.slice(0, 2).toUpperCase()
    const newMember: ExtendedTeamMember = {
      id: `m-${Date.now()}`,
      name: email.split('@')[0],
      email,
      initials,
      role,
      tone: 'indigo',
      online: false,
      lastActive: 'Invitation sent',
      joinedDate: 'Today',
      status: 'pending',
    }
    setMembers((prev) => [...prev, newMember])
    toast(`Invitation sent to ${email} as ${role}.`)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#E9E7F0] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
              Team Members
            </h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              {onlineCount} Online Now
            </span>
          </div>
          <p className="mt-1 text-sm sm:text-base text-[#6B7280]">
            Manage member permissions, invite collaborators, and oversee workspace access.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="h-11 rounded-xl bg-[#6C4CF1] px-5 text-sm font-bold text-white shadow-md shadow-[#6C4CF1]/20 hover:bg-[#5738D6]"
        >
          <UserPlus className="size-4.5" />
          <span>Invite Member</span>
        </Button>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Members', count: members.length, note: 'Out of 10 seats', icon: Users, color: 'text-[#6C4CF1] bg-[#6C4CF1]/10' },
          { label: 'Online Now', count: onlineCount, note: 'Realtime active', icon: UserCheck, color: 'text-[#16A34A] bg-[#16A34A]/10' },
          { label: 'Administrators', count: adminCount, note: 'Full workspace rights', icon: ShieldCheck, color: 'text-[#EC4899] bg-[#EC4899]/10' },
          { label: 'Pending Invites', count: pendingCount, note: 'Awaiting acceptance', icon: Mail, color: 'text-[#F59E0B] bg-[#F59E0B]/10' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-2xl border border-[#E9E7F0] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-[#6B7280]">{stat.label}</span>
                <span className={`grid size-9 place-items-center rounded-xl ${stat.color}`}>
                  <Icon className="size-4.5" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#1F2937]">{stat.count}</span>
                <span className="text-xs font-medium text-gray-400">{stat.note}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Controls: Search, Role filter, Status filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E9E7F0] bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 size-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email address..."
            className="h-10 w-full rounded-xl border border-[#E9E7F0] pl-10 pr-3.5 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="h-10 rounded-xl border border-[#E9E7F0] bg-white px-3 text-xs font-semibold text-gray-700 outline-none hover:border-[#6C4CF1]"
          >
            <option value="All">All Roles</option>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 rounded-xl border border-[#E9E7F0] bg-white px-3 text-xs font-semibold text-gray-700 outline-none hover:border-[#6C4CF1]"
          >
            <option value="All">All Statuses</option>
            <option value="Online">Online Now</option>
            <option value="Offline">Offline</option>
            <option value="Pending">Pending Invite</option>
          </select>
        </div>
      </div>

      {/* 4. Team Members Table with stable min-height */}
      <div className="overflow-hidden rounded-2xl border border-[#E9E7F0] bg-white shadow-xs min-h-[460px]">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="border-b border-[#E9E7F0] bg-[#F7F5FF]/60 text-xs font-extrabold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="py-3.5 px-4">Member</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">Presence</th>
              <th className="py-3.5 px-4 hidden md:table-cell">Date Joined</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((member) => (
              <tr key={member.id} className="hover:bg-[#F7F5FF]/50 transition">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar initials={member.initials} name={member.name} tone={member.tone} size="md" status={member.online} />
                    <div className="min-w-0">
                      <p className="font-bold text-[#1F2937] text-sm sm:text-base">{member.name}</p>
                      <p className="text-xs text-gray-400 truncate">{member.email}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <select
                    value={member.role}
                    disabled={member.role === 'Owner'}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700 outline-none disabled:bg-transparent disabled:border-transparent disabled:text-gray-900"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    {member.role === 'Owner' && <option value="Owner">Owner</option>}
                  </select>
                </td>

                <td className="py-3.5 px-4 hidden sm:table-cell">
                  {member.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                      <span>Pending</span>
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                        member.online ? 'text-[#16A34A]' : 'text-gray-400'
                      }`}
                    >
                      <span className={`size-2 rounded-full ${member.online ? 'bg-[#16A34A] animate-pulse' : 'bg-gray-300'}`} />
                      <span>{member.online ? 'Active now' : member.lastActive}</span>
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 hidden md:table-cell text-xs font-medium text-gray-500">
                  {member.joinedDate}
                </td>

                <td className="py-3.5 px-4 text-right">
                  {member.role !== 'Owner' && (
                    <button
                      type="button"
                      onClick={() => handleRemove(member.id, member.name)}
                      className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove member"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteMemberDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  )
}
