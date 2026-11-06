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

  return <main className="min-h-screen bg-white">
    <header className="flex h-[68px] items-center justify-between border-b border-gray-200 px-5 sm:px-8"><Brand href="/dashboard" /><Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-950"><ArrowLeft aria-hidden="true" className="size-4" /> Back to dashboard</Link></header>
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10"><div className="mb-8"><p className="text-xs font-medium text-gray-500">Northstar Studio</p><h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-gray-950">Workspace settings</h1><p className="mt-2 text-sm text-gray-500">Manage your workspace, members, and preferences.</p></div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">{sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActive(id)} aria-current={active === id ? 'page' : undefined} className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition ${active === id ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><Icon aria-hidden="true" className="size-4" />{label}</button>)}</nav>
        <div className="min-w-0">
          {active === 'general' && <section className="rounded-xl border border-gray-200 bg-white"><div className="border-b border-gray-100 px-5 py-4"><h2 className="text-sm font-semibold text-gray-900">General</h2><p className="mt-1 text-xs text-gray-500">Update the name and address for your workspace.</p></div><form onSubmit={saveSettings} className="flex flex-col gap-5 p-5"><div className="max-w-xl"><label htmlFor="settings-workspace-name" className="mb-1.5 block text-sm font-medium text-gray-700">Workspace name</label><input id="settings-workspace-name" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /><p className="mt-1.5 text-xs text-gray-500">This is how your workspace appears to members.</p></div><div className="max-w-xl"><label htmlFor="settings-workspace-slug" className="mb-1.5 block text-sm font-medium text-gray-700">Workspace URL</label><div className="flex h-10 items-center rounded-lg border border-gray-200 focus-within:border-indigo-500 focus-within:ring-3 focus-within:ring-indigo-100"><span className="pl-3 text-xs text-gray-400">syncspace.app/</span><input id="settings-workspace-slug" value={workspaceSlug} onChange={(event) => setWorkspaceSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="h-full min-w-0 flex-1 rounded-r-lg bg-transparent px-1 text-sm outline-none" /></div></div><div className="flex justify-end border-t border-gray-100 pt-4"><Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Save changes</Button></div></form></section>}

          {active === 'members' && <section className="rounded-xl border border-gray-200 bg-white"><div className="flex items-start justify-between border-b border-gray-100 px-5 py-4"><div><h2 className="text-sm font-semibold text-gray-900">Members</h2><p className="mt-1 text-xs text-gray-500">People who can access Northstar Studio.</p></div><Button type="button" onClick={() => toast('Member invites are not sent in this frontend demo.')} className="bg-indigo-600 text-white hover:bg-indigo-700"><Users2 data-icon="inline-start" /> Invite member</Button></div><div className="divide-y divide-gray-100">{[
            { name: 'Rohit Kumar', email: 'rohit@northstar.co', role: 'Owner', initials: 'RK', tone: 'slate' as const },
            { name: 'Maya Chen', email: 'maya@northstar.co', role: 'Admin', initials: 'MC', tone: 'indigo' as const },
            { name: 'Jordan Lee', email: 'jordan@northstar.co', role: 'Member', initials: 'JL', tone: 'emerald' as const },
            { name: 'Aisha Shah', email: 'aisha@northstar.co', role: 'Member', initials: 'AS', tone: 'amber' as const },
          ].map((member) => <div key={member.email} className="flex items-center gap-3 px-5 py-4"><UserAvatar initials={member.initials} name={member.name} tone={member.tone} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-gray-800">{member.name}</p><p className="truncate text-xs text-gray-500">{member.email}</p></div><span className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600">{member.role}</span><button type="button" onClick={() => toast(`${member.name}’s member details are read-only in this demo.`)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100" aria-label={`More options for ${member.name}`}><ChevronRight className="size-4" /></button></div>)}</div></section>}

          {active === 'roles' && <section className="rounded-xl border border-gray-200 bg-white"><div className="border-b border-gray-100 px-5 py-4"><h2 className="text-sm font-semibold text-gray-900">Roles & permissions</h2><p className="mt-1 text-xs text-gray-500">Choose the access level that fits each person&apos;s work.</p></div><div className="divide-y divide-gray-100">{[
            { title: 'Owner', description: 'Full access to workspace settings, billing, and content.', permissions: ['Manage workspace', 'Invite and remove members', 'Manage all content'] },
            { title: 'Admin', description: 'Manage members and all workspace content.', permissions: ['Manage members', 'Manage all content', 'Update workspace details'] },
            { title: 'Member', description: 'Create, update, and collaborate on workspace content.', permissions: ['Create documents and projects', 'Collaborate with teammates', 'View shared content'] },
          ].map((role) => <div key={role.title} className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_1fr]"><div><h3 className="text-sm font-semibold text-gray-900">{role.title}</h3><p className="mt-1 text-xs leading-5 text-gray-500">{role.description}</p></div><ul className="flex flex-col gap-2">{role.permissions.map((permission) => <li key={permission} className="flex items-center gap-2 text-xs text-gray-600"><Check aria-hidden="true" className="size-3.5 text-green-600" />{permission}</li>)}</ul></div>)}</div></section>}

          {active === 'notifications' && <section className="rounded-xl border border-gray-200 bg-white"><div className="border-b border-gray-100 px-5 py-4"><h2 className="text-sm font-semibold text-gray-900">Notifications</h2><p className="mt-1 text-xs text-gray-500">Choose which updates you want to hear about.</p></div><div className="divide-y divide-gray-100">{[
            { key: 'mentions' as const, title: 'Mentions and replies', description: 'When someone mentions you or replies to your comment.' },
            { key: 'updates' as const, title: 'Project updates', description: 'Progress changes and activity in your projects.' },
            { key: 'weekly' as const, title: 'Weekly summary', description: 'A weekly snapshot of activity across your workspace.' },
          ].map((setting) => <label key={setting.key} className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4"><span><span className="block text-sm font-medium text-gray-800">{setting.title}</span><span className="mt-1 block text-xs leading-5 text-gray-500">{setting.description}</span></span><input type="checkbox" checked={notifications[setting.key]} onChange={(event) => setNotifications((current) => ({ ...current, [setting.key]: event.target.checked }))} className="size-4 shrink-0 accent-indigo-600" /></label>)}</div><div className="flex justify-end border-t border-gray-100 p-5"><Button type="button" onClick={() => toast('Notification preferences saved in this demo.')} className="bg-indigo-600 text-white hover:bg-indigo-700">Save preferences</Button></div></section>}

          {active === 'account' && <div className="flex flex-col gap-4"><section className="rounded-xl border border-gray-200 bg-white"><div className="border-b border-gray-100 px-5 py-4"><h2 className="text-sm font-semibold text-gray-900">Account settings</h2><p className="mt-1 text-xs text-gray-500">Your personal profile and sign-in preferences.</p></div><div className="flex items-center gap-4 p-5"><UserAvatar initials="RK" name="Rohit Kumar" tone="slate" size="lg" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-gray-900">Rohit Kumar</p><p className="mt-1 text-xs text-gray-500">rohit@northstar.co</p></div><Button type="button" variant="outline" onClick={() => toast('Profile editing is not connected in this frontend demo.')}>Edit profile</Button></div><div className="flex items-center gap-3 border-t border-gray-100 p-5"><LockKeyhole aria-hidden="true" className="size-4 text-gray-400" /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-gray-800">Password</p><p className="mt-1 text-xs text-gray-500">Update your account password.</p></div><Button type="button" variant="outline" onClick={() => toast('Password changes are not connected in this frontend demo.')}>Change password</Button></div></section><section className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-center gap-3"><CreditCard aria-hidden="true" className="size-4 text-gray-400" /><div><h2 className="text-sm font-semibold text-gray-900">Plan and billing</h2><p className="mt-1 text-xs text-gray-500">You are using the free demo workspace.</p></div></div><Button type="button" variant="outline" className="mt-4" onClick={() => toast('Billing is not connected in this frontend phase.')}>Manage plan</Button></section></div>}
        </div>
      </div>
    </div>
  </main>
}
