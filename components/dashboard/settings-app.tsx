'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Check, ChevronRight, CreditCard, LockKeyhole, Settings2, ShieldCheck, Users2, UserRound } from 'lucide-react'
import { Brand } from '@/components/brand/brand'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'

const sections = [
  { id: 'general', label: 'General', icon: Settings2 },
  { id: 'members', label: 'Members', icon: Users2 },
  { id: 'roles', label: 'Roles & permissions', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'account', label: 'Account settings', icon: UserRound },
] as const

type SectionId = (typeof sections)[number]['id']

export function SettingsApp() {
  const [active, setActive] = useState<SectionId>('general')
  const toast = useToast()
  const [notifications, setNotifications] = useState({ mentions: true, updates: true, weekly: false })
  const [workspaceName, setWorkspaceName] = useState('Northstar Studio')
  const [workspaceSlug, setWorkspaceSlug] = useState('northstar-studio')

  const saveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast('Your settings were saved in this demo.')
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="flex h-[76px] items-center justify-between border-b border-gray-200 px-6 sm:px-10 lg:px-16">
        <Brand href="/dashboard" size="lg" />
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-semibold text-gray-700 transition hover:text-gray-950">
          <ArrowLeft aria-hidden="true" className="size-4.5" />
          <span>Back to dashboard</span>
        </Link>
      </header>

      <div className="mx-auto w-full max-w-[1780px] 2xl:max-w-[1880px] px-6 sm:px-10 lg:px-16 py-10">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Northstar Studio</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-950">Workspace settings</h1>
          <p className="mt-2 text-base text-gray-600">Manage your workspace configuration, team members, and system preferences.</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <nav aria-label="Settings sections" className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                aria-current={active === id ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium transition ${
                  active === id
                    ? 'bg-indigo-50 font-bold text-indigo-700 shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="min-w-0">
            {active === 'general' && (
              <section className="rounded-2xl border border-gray-200 bg-white shadow-xs">
                <div className="border-b border-gray-100 px-7 py-5">
                  <h2 className="text-base font-bold text-gray-950">General Configuration</h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Update your workspace brand name and public access address.</p>
                </div>
                <form onSubmit={saveSettings} className="flex flex-col gap-6 p-7">
                  <div className="max-w-2xl">
                    <label htmlFor="settings-workspace-name" className="mb-2 block text-sm font-semibold text-gray-800">Workspace name</label>
                    <input
                      id="settings-workspace-name"
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">This is how your team workspace appears to all members and invitees.</p>
                  </div>
                  <div className="max-w-2xl">
                    <label htmlFor="settings-workspace-slug" className="mb-2 block text-sm font-semibold text-gray-800">Workspace URL</label>
                    <div className="flex h-12 items-center rounded-xl border border-gray-200 transition focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-100">
                      <span className="pl-4 text-sm font-medium text-gray-400">syncspace.app/</span>
                      <input
                        id="settings-workspace-slug"
                        value={workspaceSlug}
                        onChange={(event) => setWorkspaceSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="h-full min-w-0 flex-1 rounded-r-xl bg-transparent px-2 text-sm font-medium text-gray-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-gray-100 pt-5">
                    <Button type="submit" className="h-11 px-6 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700">
                      Save changes
                    </Button>
                  </div>
                </form>
              </section>
            )}

            {active === 'members' && (
              <section className="rounded-2xl border border-gray-200 bg-white shadow-xs">
                <div className="flex items-start justify-between border-b border-gray-100 px-7 py-5">
                  <div>
                    <h2 className="text-base font-bold text-gray-950">Team Members</h2>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">People with verified access to Northstar Studio.</p>
                  </div>
                  <Button type="button" onClick={() => toast('Member invites are available in the full API.')} className="h-10 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700">
                    <Users2 data-icon="inline-start" className="size-4" />
                    <span>Invite member</span>
                  </Button>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { name: 'Rohit Kumar', email: 'rohit@northstar.co', role: 'Owner', initials: 'RK', tone: 'slate' as const },
                    { name: 'Maya Chen', email: 'maya@northstar.co', role: 'Admin', initials: 'MC', tone: 'indigo' as const },
                    { name: 'Jordan Lee', email: 'jordan@northstar.co', role: 'Member', initials: 'JL', tone: 'emerald' as const },
                    { name: 'Aisha Shah', email: 'aisha@northstar.co', role: 'Member', initials: 'AS', tone: 'amber' as const },
                  ].map((member) => (
                    <div key={member.email} className="flex items-center gap-4 px-7 py-5">
                      <UserAvatar initials={member.initials} name={member.name} tone={member.tone} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">{member.name}</p>
                        <p className="truncate text-xs text-gray-500">{member.email}</p>
                      </div>
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">{member.role}</span>
                      <button type="button" onClick={() => toast(`${member.name}’s member details are read-only in this demo.`)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label={`More options for ${member.name}`}>
                        <ChevronRight className="size-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === 'roles' && (
              <section className="rounded-2xl border border-gray-200 bg-white shadow-xs">
                <div className="border-b border-gray-100 px-7 py-5">
                  <h2 className="text-base font-bold text-gray-950">Roles & Permissions</h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Fine-grained access levels enforced across API and Socket.IO channels.</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { title: 'Owner', description: 'Full access to workspace settings, billing, data export, and member management.', permissions: ['Manage workspace & billing', 'Invite and remove members', 'Full CRUD across all data'] },
                    { title: 'Admin', description: 'Manage members, projects, documents, and workspace configuration.', permissions: ['Manage members', 'Manage all content', 'Update workspace details'] },
                    { title: 'Member', description: 'Create, edit, collaborate, and execute tasks across shared projects.', permissions: ['Create documents and projects', 'Collaborate with teammates', 'View shared content'] },
                  ].map((role) => (
                    <div key={role.title} className="grid gap-6 px-7 py-6 sm:grid-cols-[1fr_1fr]">
                      <div>
                        <h3 className="text-base font-bold text-gray-950">{role.title}</h3>
                        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-gray-500">{role.description}</p>
                      </div>
                      <ul className="flex flex-col gap-2.5">
                        {role.permissions.map((permission) => (
                          <li key={permission} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                            <Check aria-hidden="true" className="size-4 text-emerald-600" />
                            <span>{permission}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === 'notifications' && (
              <section className="rounded-2xl border border-gray-200 bg-white shadow-xs">
                <div className="border-b border-gray-100 px-7 py-5">
                  <h2 className="text-base font-bold text-gray-950">Notification Preferences</h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Choose which updates trigger background worker jobs and alerts.</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { key: 'mentions' as const, title: 'Mentions and replies', description: 'Realtime alerts when teammates mention you in documents or comments.' },
                    { key: 'updates' as const, title: 'Project progress updates', description: 'Automated recalculation alerts when project milestones change.' },
                    { key: 'weekly' as const, title: 'Weekly executive summary', description: 'Comprehensive weekly report on tasks, documents, and team output.' },
                  ].map((setting) => (
                    <label key={setting.key} className="flex cursor-pointer items-center justify-between gap-6 px-7 py-5 transition hover:bg-gray-50/60">
                      <div>
                        <span className="block text-sm font-bold text-gray-900">{setting.title}</span>
                        <span className="mt-1 block text-xs sm:text-sm text-gray-500">{setting.description}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[setting.key]}
                        onChange={(event) => setNotifications((current) => ({ ...current, [setting.key]: event.target.checked }))}
                        className="size-5 shrink-0 rounded border-gray-300 accent-indigo-600"
                      />
                    </label>
                  ))}
                </div>
                <div className="flex justify-end border-t border-gray-100 p-6">
                  <Button type="button" onClick={() => toast('Notification preferences saved.')} className="h-11 px-6 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700">
                    Save preferences
                  </Button>
                </div>
              </section>
            )}

            {active === 'account' && (
              <div className="flex flex-col gap-6">
                <section className="rounded-2xl border border-gray-200 bg-white shadow-xs">
                  <div className="border-b border-gray-100 px-7 py-5">
                    <h2 className="text-base font-bold text-gray-950">Account Profile</h2>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">Your personal profile and credentials.</p>
                  </div>
                  <div className="flex items-center gap-5 p-7">
                    <UserAvatar initials="RK" name="Rohit Kumar" tone="slate" size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-gray-950">Rohit Kumar</p>
                      <p className="text-xs sm:text-sm text-gray-500">rohit@northstar.co</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => toast('Profile editing is enabled.')} className="rounded-xl">
                      Edit profile
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 border-t border-gray-100 p-7">
                    <LockKeyhole aria-hidden="true" className="size-5 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900">Password & Authentication</p>
                      <p className="text-xs sm:text-sm text-gray-500">Protected with bcrypt hashing and JWT tokens.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => toast('Password modal ready.')} className="rounded-xl">
                      Change password
                    </Button>
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xs">
                  <div className="flex items-center gap-4">
                    <CreditCard aria-hidden="true" className="size-5 text-gray-400" />
                    <div>
                      <h2 className="text-base font-bold text-gray-950">Subscription & Cluster Plan</h2>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">Running on the Pro Dedicated Cluster tier.</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" className="mt-5 rounded-xl" onClick={() => toast('Billing portal connected.')}>
                    Manage subscription
                  </Button>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
