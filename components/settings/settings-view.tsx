'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Check,
  CreditCard,
  KeyRound,
  Lock,
  Moon,
  Palette,
  Save,
  Server,
  Settings,
  Shield,
  Sun,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/dashboard/user-avatar'
import { useToast } from '@/components/providers/toast-provider'

type SettingsTab = 'profile' | 'security' | 'workspace' | 'notifications' | 'appearance' | 'danger'

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [name, setName] = useState('Rohit Kumar')
  const [email, setEmail] = useState('rohit@northstar.co')
  const [bio, setBio] = useState('Building scalable real-time collaboration platforms.')
  const [workspaceName, setWorkspaceName] = useState('Northstar Studio')
  const [workspaceSlug, setWorkspaceSlug] = useState('northstar-studio')

  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    taskAssigned: true,
    documentMention: true,
    weeklyDigest: false,
  })

  const [appearance, setAppearance] = useState<'lavender' | 'default'>('lavender')
  const [textSize, setTextSize] = useState<'normal' | 'large'>('large')

  const toast = useToast()

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const stored = localStorage.getItem('syncspace_user')
      const current = stored ? JSON.parse(stored) : {}
      localStorage.setItem('syncspace_user', JSON.stringify({ ...current, name, email }))
    } catch {}
    toast('Profile updated successfully.')
  }

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault()
    toast(`Workspace settings saved for “${workspaceName}”.`)
  }

  const handleRevokeSession = () => {
    toast('Other active sessions revoked.')
  }

  const handleDeleteWorkspace = () => {
    toast('Workspace deletion requires owner two-factor confirmation.')
  }

  const navItems = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Account Security', icon: KeyRound },
    { id: 'workspace', label: 'Workspace Settings', icon: Settings },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ] as const

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="border-b border-[#E9E7F0] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
          Settings & Preferences
        </h1>
        <p className="mt-1 text-sm sm:text-base text-[#6B7280]">
          Manage your personal profile, security credentials, workspace configuration, and notifications.
        </p>
      </div>

      {/* 2. Layout Grid */}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Navigation Sidebar */}
        <nav aria-label="Settings categories" className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm sm:text-base font-semibold transition ${
                activeTab === id
                  ? 'bg-[#6C4CF1] text-white shadow-sm font-bold'
                  : 'text-gray-600 hover:bg-[#F7F5FF] hover:text-[#6C4CF1]'
              } ${id === 'danger' && activeTab !== 'danger' ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : ''}`}
            >
              <Icon className="size-5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Content Panel */}
        <div className="min-w-0">
          {/* A. Profile Settings */}
          {activeTab === 'profile' && (
            <section className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-extrabold text-[#1F2937] border-b border-gray-100 pb-4">
                Profile Settings
              </h2>
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                  <UserAvatar initials="RK" name={name} tone="indigo" size="lg" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => toast('Profile avatar upload dialog opened.')}
                      className="h-9 px-3 rounded-xl border-gray-200 text-xs font-bold"
                    >
                      Change Photo
                    </Button>
                    <p className="mt-1 text-xs text-gray-400">JPG, PNG or GIF, max 2MB.</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="user-name" className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    id="user-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#E9E7F0] px-3.5 text-base outline-none focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
                  />
                </div>

                <div>
                  <label htmlFor="user-email" className="mb-1.5 block text-sm font-semibold text-gray-700">Email Address</label>
                  <input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#E9E7F0] px-3.5 text-base outline-none focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
                  />
                </div>

                <div>
                  <label htmlFor="user-bio" className="mb-1.5 block text-sm font-semibold text-gray-700">Bio</label>
                  <textarea
                    id="user-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full resize-none rounded-xl border border-[#E9E7F0] px-3.5 py-2 text-sm outline-none focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
                  />
                </div>

                <Button type="submit" className="h-11 rounded-xl bg-[#6C4CF1] px-6 text-sm font-bold text-white hover:bg-[#5738D6]">
                  Save Changes
                </Button>
              </form>
            </section>
          )}

          {/* B. Account Security */}
          {activeTab === 'security' && (
            <section className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-8 shadow-xs space-y-8">
              <div>
                <h2 className="text-lg font-extrabold text-[#1F2937] border-b border-gray-100 pb-4">
                  Account Security & Password
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    toast('Password updated.')
                  }}
                  className="mt-6 space-y-4 max-w-xl"
                >
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="h-11 w-full rounded-xl border border-[#E9E7F0] px-3.5 text-base outline-none focus:border-[#6C4CF1]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="h-11 w-full rounded-xl border border-[#E9E7F0] px-3.5 text-base outline-none focus:border-[#6C4CF1]"
                    />
                  </div>
                  <Button type="submit" className="h-11 rounded-xl bg-[#6C4CF1] px-5 text-sm font-bold text-white hover:bg-[#5738D6]">
                    Update Password
                  </Button>
                </form>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-base font-bold text-[#1F2937]">Active Sessions</h3>
                <p className="text-xs text-gray-500 mt-0.5">Devices currently signed into your SyncSpace account.</p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3.5 bg-gray-50/50">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Chrome on Windows (Current Session)</p>
                      <p className="text-xs text-emerald-600 font-semibold">● Active right now · Local IP</p>
                    </div>
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">This Device</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRevokeSession}
                  className="mt-4 h-10 rounded-xl border-gray-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-200"
                >
                  Revoke All Other Sessions
                </Button>
              </div>
            </section>
          )}

          {/* C. Workspace Settings */}
          {activeTab === 'workspace' && (
            <section className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-extrabold text-[#1F2937] border-b border-gray-100 pb-4">
                Workspace Configuration
              </h2>
              <form onSubmit={handleSaveWorkspace} className="mt-6 space-y-6 max-w-2xl">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Workspace Display Name</label>
                  <input
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#E9E7F0] px-3.5 text-base outline-none focus:border-[#6C4CF1]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Workspace URL Identifier</label>
                  <div className="flex items-center gap-1 h-11 w-full rounded-xl border border-[#E9E7F0] px-3.5 text-sm bg-gray-50/60 font-mono text-gray-500">
                    <span>syncspace.app/</span>
                    <input
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value)}
                      className="flex-1 bg-transparent font-bold text-gray-900 outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-[#F7F5FF]/60 p-4 text-xs text-indigo-900">
                  <p className="font-bold">Pro Plan Tier (Active)</p>
                  <p className="mt-1 text-gray-600">Your workspace includes 10 member seats, 10 GB cloud asset storage, and unlimited real-time documents.</p>
                </div>

                <Button type="submit" className="h-11 rounded-xl bg-[#6C4CF1] px-6 text-sm font-bold text-white hover:bg-[#5738D6]">
                  Save Workspace
                </Button>
              </form>
            </section>
          )}

          {/* D. Notification Settings */}
          {activeTab === 'notifications' && (
            <section className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-extrabold text-[#1F2937] border-b border-gray-100 pb-4">
                Notification Preferences
              </h2>
              <div className="mt-6 space-y-4 max-w-2xl">
                {[
                  { key: 'emailAlerts', title: 'Email Alerts for Mentions', desc: 'Notify me when a team member tags me in a document or comment.' },
                  { key: 'taskAssigned', title: 'Task Assignment Notifications', desc: 'Send a prompt when a sprint deliverable is assigned to me.' },
                  { key: 'documentMention', title: 'Document Collaboration Updates', desc: 'Realtime updates when shared documents receive major revisions.' },
                  { key: 'weeklyDigest', title: 'Weekly Sprint Digest', desc: 'A summary email every Monday morning with pending deliverables.' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-[#F7F5FF]/40 transition cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-sm text-[#1F2937]">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notifs as any)[item.key]}
                      onChange={(e) => setNotifs({ ...notifs, [item.key]: e.target.checked })}
                      className="mt-1 size-5 rounded border-gray-300 text-[#6C4CF1] focus:ring-[#6C4CF1] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* E. Appearance */}
          {activeTab === 'appearance' && (
            <section className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-extrabold text-[#1F2937] border-b border-gray-100 pb-4">
                Appearance & Theme
              </h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Theme Palette</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setAppearance('lavender')}
                      className={`p-4 rounded-xl border text-left transition ${
                        appearance === 'lavender'
                          ? 'border-[#6C4CF1] bg-[#F7F5FF] ring-2 ring-[#6C4CF1]/20'
                          : 'border-gray-200'
                      }`}
                    >
                      <p className="font-bold text-sm text-gray-900">Soft Lavender (#F7F5FF)</p>
                      <p className="text-xs text-gray-500 mt-1">SaaS production palette with purple accents.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppearance('default')}
                      className={`p-4 rounded-xl border text-left transition ${
                        appearance === 'default'
                          ? 'border-[#6C4CF1] bg-[#F7F5FF] ring-2 ring-[#6C4CF1]/20'
                          : 'border-gray-200'
                      }`}
                    >
                      <p className="font-bold text-sm text-gray-900">Clean White</p>
                      <p className="text-xs text-gray-500 mt-1">Neutral light background.</p>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">Content Sizing</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setTextSize('large')}
                      className={`p-4 rounded-xl border text-left transition ${
                        textSize === 'large'
                          ? 'border-[#6C4CF1] bg-[#F7F5FF] ring-2 ring-[#6C4CF1]/20'
                          : 'border-gray-200'
                      }`}
                    >
                      <p className="font-bold text-sm text-gray-900">Comfortable (Recommended)</p>
                      <p className="text-xs text-gray-500 mt-1">Optimized for wide screens and laptops.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextSize('normal')}
                      className={`p-4 rounded-xl border text-left transition ${
                        textSize === 'normal'
                          ? 'border-[#6C4CF1] bg-[#F7F5FF] ring-2 ring-[#6C4CF1]/20'
                          : 'border-gray-200'
                      }`}
                    >
                      <p className="font-bold text-sm text-gray-900">Compact</p>
                      <p className="text-xs text-gray-500 mt-1">High-density information view.</p>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* F. Danger Zone */}
          {activeTab === 'danger' && (
            <section className="rounded-2xl border border-red-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-red-100 pb-4 text-red-600">
                <AlertTriangle className="size-5" />
                <h2 className="text-lg font-extrabold">Danger Zone</h2>
              </div>

              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30">
                  <div>
                    <p className="font-bold text-sm text-gray-900">Leave Workspace</p>
                    <p className="text-xs text-gray-500">Revoke your account membership from Northstar Studio.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => toast('Leaving workspace requires another admin.')}
                    className="h-9 rounded-xl border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Leave Workspace
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">
                  <div>
                    <p className="font-bold text-sm text-red-900">Delete Workspace</p>
                    <p className="text-xs text-red-600">Permanently delete this workspace, documents, and all tasks.</p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleDeleteWorkspace}
                    className="h-9 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
                  >
                    Delete Workspace
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
