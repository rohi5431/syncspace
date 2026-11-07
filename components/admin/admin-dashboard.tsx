'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Database,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  XCircle,
} from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

type AdminSection = 'overview' | 'users' | 'organizations' | 'monitoring' | 'audit'

interface SeriesPoint {
  bucket: string
  count: number
}

interface AdminAnalytics {
  users: number
  activeUsers: number
  suspendedUsers: number
  organizations: number
  activeOrganizations: number
  projects: number
  documents: number
  tasks: number
  completedTasks: number
  storageBytes: number | null
  newUsersInRange: number
  newOrganizationsInRange: number
  registrationGrowth: SeriesPoint[]
  organizationGrowth: SeriesPoint[]
  projectGrowth: SeriesPoint[]
  taskGrowth: SeriesPoint[]
  documentGrowth: SeriesPoint[]
  activeUserTrend: SeriesPoint[]
  organizationActivity: Array<{ workspaceId: string; organizationName: string; activityCount: number }>
  recentActivity: Array<{ id: string; name: string; action: string; target: string; createdAt: string; workspace: { name: string } }>
}

interface MonitoringStatus {
  api: {
    status: string
    requestCount: number
    requestsPerSecond: number
    averageLatencyMs: number | null
    p95LatencyMs: number | null
    p99LatencyMs: number | null
    errors4xx: number
    errors5xx: number
    errorRate: number
    sampleWindow: string
  }
  database: { status: string; latencyMs: number | null; activeConnections: number | null; databaseBytes: number | null }
  redis: { status: string; latencyMs: number | null; usedMemoryBytes: number | null; connectedClients: number | null }
  websocket: { status: string; latencyMs: number | null; connections: number | null }
  worker: {
    status: string
    latencyMs: number | null
    queue?: { status: string; waiting?: number; active?: number; completed?: number; failed?: number; delayed?: number; pausedJobs?: number }
  }
  mongo: { status: string; totalBytes: number | null; fileCount: number | null }
  infrastructure: { processMemoryBytes: { rss: number; heapUsed: number }; diskUsageBytes: number | null; networkTrafficBytes: number | null }
  checkedAt: string
}

interface AdminUser {
  id: string
  name: string
  email: string
  initials: string
  role: string
  platformRole: string
  isSuspended: boolean
  emailVerifiedAt: string | null
  lastLoginAt: string | null
  createdAt: string
  _count: { memberships: number; tokens: number }
}

interface AdminWorkspace {
  id: string
  name: string
  slug: string
  createdAt: string
  isSuspended: boolean
  members: Array<{ user: { id: string; name: string; email: string } }>
  _count: { members: number; projects: number; documents: number }
}

interface PageResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface AuditLog {
  id: string
  actorEmail: string
  action: string
  resourceType: string
  resourceId: string
  success: boolean
  createdAt: string
}

interface AdminOverview {
  range: string
  analytics: AdminAnalytics
  monitoring: MonitoringStatus
}

const sections: Array<{ id: AdminSection; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'organizations', label: 'Organizations', icon: Building2 },
  { id: 'monitoring', label: 'System monitoring', icon: Activity },
  { id: 'audit', label: 'Audit logs', icon: ShieldAlert },
]

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AdminDashboard() {
  const router = useRouter()
  const [section, setSection] = useState<AdminSection>('overview')
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [workspaces, setWorkspaces] = useState<AdminWorkspace[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [range, setRange] = useState('30d')
  const [userPage, setUserPage] = useState(1)
  const [workspacePage, setWorkspacePage] = useState(1)
  const [auditPage, setAuditPage] = useState(1)
  const [userPagination, setUserPagination] = useState<PageResult<AdminUser> | null>(null)
  const [workspacePagination, setWorkspacePagination] = useState<PageResult<AdminWorkspace> | null>(null)
  const [auditPagination, setAuditPagination] = useState<PageResult<AuditLog> | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [auditError, setAuditError] = useState('')

  const loadData = useCallback(async () => {
    setError('')
    setAuditError('')
    try {
      const usersQuery = new URLSearchParams({ page: String(userPage), pageSize: '10' })
      const workspacesQuery = new URLSearchParams({ page: String(workspacePage), pageSize: '10' })
      const auditQuery = new URLSearchParams({ page: String(auditPage), pageSize: '10' })
      if (query.trim()) {
        usersQuery.set('search', query.trim())
        workspacesQuery.set('search', query.trim())
        auditQuery.set('search', query.trim())
      }
      if (statusFilter !== 'all') {
        usersQuery.set('status', statusFilter)
        workspacesQuery.set('status', statusFilter)
      }
      const [responses, auditResponse] = await Promise.all([
        Promise.all([
          apiFetch(`/api/admin/overview?range=${range}`),
          apiFetch(`/api/admin/users?${usersQuery}`),
          apiFetch(`/api/admin/workspaces?${workspacesQuery}`),
        ]),
        apiFetch(`/api/admin/audit-logs?${auditQuery}`).catch(() => null),
      ])
      const failedResponse = responses.find((response) => !response.ok)
      if (failedResponse) {
        const message = await failedResponse.text()
        if (failedResponse.status === 401) {
          router.replace('/login')
        } else if (failedResponse.status === 403) {
          router.replace('/dashboard')
        }
        throw new Error(message || `Admin request failed (${failedResponse.status})`)
      }
      const [nextOverview, nextUsers, nextWorkspaces] = await Promise.all(
        responses.map((response) => response.json()),
      )
      setOverview(nextOverview)
      setUsers(nextUsers.items)
      setUserPagination(nextUsers)
      setWorkspaces(nextWorkspaces.items)
      setWorkspacePagination(nextWorkspaces)
      if (auditResponse?.ok) {
        const nextAudit: PageResult<AuditLog> = await auditResponse.json()
        setAuditLogs(nextAudit.items)
        setAuditPagination(nextAudit)
      } else {
        setAuditLogs([])
        setAuditPagination(null)
        if (!auditResponse) {
          setAuditError('Could not connect to the audit-log endpoint. Check that the API is running.')
        } else if (auditResponse.status === 401) {
          router.replace('/login')
        } else if (auditResponse.status === 403) {
          router.replace('/dashboard')
        } else {
          setAuditError(`Audit logs are unavailable (HTTP ${auditResponse.status}). Restart the API to load the latest admin routes.`)
        }
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load platform data')
    } finally {
      setLoading(false)
    }
  }, [auditPage, query, range, router, statusFilter, userPage, workspacePage])

  useEffect(() => {
    const storedUser = localStorage.getItem('syncspace_user')
    if (!localStorage.getItem('syncspace_token')) {
      router.replace('/login')
      return
    }
    try {
      if (JSON.parse(storedUser || '{}').platformRole !== 'ADMIN') {
        router.replace('/dashboard')
        return
      }
    } catch {
      router.replace('/dashboard')
      return
    }
    const initialLoadId = window.setTimeout(() => void loadData(), 0)
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void loadData()
    }
    const intervalId = window.setInterval(refreshWhenVisible, 30_000)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.clearTimeout(initialLoadId)
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [loadData, router])

  const toggleSuspension = async (user: AdminUser) => {
    const suspended = !user.isSuspended
    const action = suspended ? 'suspend' : 'restore'
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return
    setPendingUserId(user.id)
    setError('')
    try {
      const response = await apiFetch(`/api/admin/users/${encodeURIComponent(user.id)}/suspension`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended }),
      })
      if (!response.ok) throw new Error(await response.text() || `Unable to ${action} user`)
      await loadData()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : `Unable to ${action} user`)
    } finally {
      setPendingUserId(null)
    }
  }

  const toggleWorkspaceSuspension = async (workspace: AdminWorkspace) => {
    const suspended = !workspace.isSuspended
    const action = suspended ? 'suspend' : 'restore'
    if (!window.confirm(`Are you sure you want to ${action} ${workspace.name}? Members will ${suspended ? 'lose access' : 'regain access'} to this organization.`)) return
    setPendingWorkspaceId(workspace.id)
    setError('')
    try {
      const response = await apiFetch(`/api/admin/workspaces/${encodeURIComponent(workspace.id)}/suspension`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended }),
      })
      if (!response.ok) throw new Error(await response.text() || `Unable to ${action} organization`)
      await loadData()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : `Unable to ${action} organization`)
    } finally {
      setPendingWorkspaceId(null)
    }
  }

  const revokeSessions = async (user: AdminUser) => {
    if (!window.confirm(`Revoke all active sessions for ${user.name}? They will need to sign in again.`)) return
    setPendingUserId(user.id)
    setError('')
    try {
      const response = await apiFetch(`/api/admin/users/${encodeURIComponent(user.id)}/revoke-sessions`, { method: 'POST' })
      if (!response.ok) throw new Error(await response.text() || 'Unable to revoke sessions')
      await loadData()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to revoke sessions')
    } finally {
      setPendingUserId(null)
    }
  }

  const updateQuery = (value: string) => {
    setQuery(value)
    setUserPage(1)
    setWorkspacePage(1)
    setAuditPage(1)
  }

  const updateStatusFilter = (value: string) => {
    setStatusFilter(value)
    setUserPage(1)
    setWorkspacePage(1)
  }

  const logout = () => {
    localStorage.removeItem('syncspace_token')
    localStorage.removeItem('syncspace_refresh_token')
    localStorage.removeItem('syncspace_user')
    localStorage.removeItem('syncspace_workspace')
    document.cookie = 'syncspace_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.replace('/login')
  }

  const analytics = overview?.analytics
  const monitoring = overview?.monitoring

  return (
    <div className="min-h-screen bg-[#f5f3ff] text-[#201b37] lg:flex">
      <aside className="flex w-full shrink-0 flex-col bg-[#211b3b] px-4 py-5 text-white lg:fixed lg:inset-y-0 lg:w-[250px]">
        <div className="flex items-center gap-3 px-3 pb-8">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#7048e8] text-lg font-bold shadow-lg shadow-violet-950/20">S</div>
          <div>
            <p className="text-sm font-semibold">SyncSpace</p>
            <p className="text-[11px] text-white/50">Platform console</p>
          </div>
        </div>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/40">Platform</p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setSection(id); updateQuery('') }}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                section === id
                  ? 'bg-gradient-to-r from-[#8b5cf6] to-[#7651e8] text-white shadow-md shadow-violet-950/20'
                  : 'text-white/60 hover:bg-white/[.08] hover:text-white'
              }`}
            >
              <Icon className="size-[17px]" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-6 flex gap-2 border-t border-white/10 pt-4 lg:mt-auto lg:flex-col">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex w-full items-center justify-start gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/65 hover:bg-white/[.08] hover:text-white"
          >
            <ArrowLeft className="size-4 shrink-0" /> Workspace collaboration
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/65 hover:bg-white/[.08] hover:text-white"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-[250px]">
        <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[#e7e2f2] bg-white/90 px-5 shadow-[0_1px_3px_rgba(32,27,55,0.04)] sm:px-8">
          <div>
            <p className="text-xs font-medium text-[#908aa5]">SyncSpace / Platform</p>
            <h1 className="mt-1 text-lg font-semibold">
              {sections.find((item) => item.id === section)?.label}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e4def3] bg-white px-3 py-2 text-sm font-medium text-[#625b7d] shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
          >
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Refresh
          </button>
        </header>

        <div className="w-full max-w-none space-y-6 p-5 sm:p-8">
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {loading && !overview ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-[#766f8b]">
              <LoaderCircle className="mr-2 size-5 animate-spin" /> Loading platform data…
            </div>
          ) : section === 'overview' ? (
            <section className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                <h2 className="text-2xl font-semibold tracking-tight">Platform overview</h2>
                <p className="mt-1 text-sm text-[#827d96]">Account growth, tenant activity, and service health.</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-[#716a87]">
                  Reporting range
                  <select value={range} onChange={(event) => setRange(event.target.value)} className="h-10 rounded-lg border border-[#e5e1ef] bg-white px-3 font-medium text-[#38334e]">
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </label>
              </div>
              <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <MetricCard label="Total users" value={analytics?.users ?? 0} icon={Users} detail={`${analytics?.newUsersInRange ?? 0} new in selected range`} tone="violet" />
                <MetricCard label="Active users" value={analytics?.activeUsers ?? 0} icon={CheckCircle2} detail="Accounts in good standing" tone="green" />
                <MetricCard label="Suspended users" value={analytics?.suspendedUsers ?? 0} icon={ShieldAlert} detail="Platform-wide suspended count" tone="red" />
                <MetricCard label="Organizations" value={analytics?.organizations ?? 0} icon={Building2} detail={`${analytics?.newOrganizationsInRange ?? 0} new in selected range`} tone="blue" />
                <MetricCard label="Projects" value={analytics?.projects ?? 0} icon={LayoutDashboard} detail="Across all organizations" tone="violet" />
                <MetricCard label="Documents" value={analytics?.documents ?? 0} icon={Activity} detail="Across all organizations" tone="blue" />
                <MetricCard label="Tasks" value={analytics?.tasks ?? 0} icon={CheckCircle2} detail={`${analytics?.completedTasks ?? 0} completed`} tone="green" />
                <MetricCard label="Active organizations" value={analytics?.activeOrganizations ?? 0} icon={Building2} detail="Organizations in good standing" tone="violet" />
                <MetricCard label="New registrations" value={analytics?.newUsersInRange ?? 0} icon={Users} detail="In selected reporting range" tone="blue" />
                <MetricCard label="Storage usage" value={formatBytes(analytics?.storageBytes)} icon={Database} detail="Across platform document storage" tone="violet" />
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                <SeriesPanel title="User growth" description="New user registrations over time" points={analytics?.registrationGrowth ?? []} color="#7c3aed" />
                <SeriesPanel title="Organization growth" description="New organizations over time" points={analytics?.organizationGrowth ?? []} color="#3b82f6" variant="bar" />
              </div>
              <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                <HealthPanel monitoring={monitoring} expanded />
                <RecentActivityPanel activity={analytics?.recentActivity ?? []} />
                <AlertsPanel monitoring={monitoring} />
              </div>
            </section>
          ) : section === 'users' ? (
            <section className="space-y-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">User management</h2>
                  <p className="mt-1 text-sm text-[#827d96]">Review accounts and suspend or restore access.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <SearchBox value={query} onChange={updateQuery} placeholder="Search users" />
                  <StatusFilter value={statusFilter} onChange={updateStatusFilter} />
                </div>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-[#e7e2f1] bg-white shadow-[0_2px_8px_rgba(47,37,84,0.05)]">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#faf9fd] text-xs uppercase tracking-wide text-[#8d879f]">
                    <tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Platform role</th><th className="px-5 py-3">Workspaces</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Last sign-in</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eef5]">
                    {users.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-violet-50/50">
                        <td className="px-5 py-4"><p className="font-semibold">{user.name}</p><p className="mt-0.5 text-xs text-[#8d879f]">{user.email}</p></td>
                        <td className="px-5 py-4">{user.platformRole === 'ADMIN' ? 'Platform admin' : 'User'}</td>
                        <td className="px-5 py-4">{user._count.memberships}</td>
                        <td className="px-5 py-4"><span className={`text-xs font-medium ${user.emailVerifiedAt ? 'text-emerald-700' : 'text-[#938da5]'}`}>{user.emailVerifiedAt ? 'Verified' : 'Unverified'}</span></td>
                        <td className="px-5 py-4 text-xs text-[#716a87]">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</td>
                        <td className="px-5 py-4"><StatusBadge status={user.isSuspended ? 'suspended' : 'active'} label={user.isSuspended ? 'Suspended' : 'Active'} /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void toggleSuspension(user)}
                              disabled={pendingUserId === user.id}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                                user.isSuspended
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {pendingUserId === user.id ? 'Saving…' : user.isSuspended ? 'Restore' : 'Suspend'}
                            </button>
                            <button type="button" onClick={() => void revokeSessions(user)} disabled={pendingUserId === user.id || user._count.tokens === 0} className="rounded-lg border border-[#e5e1ef] px-3 py-1.5 text-xs font-semibold text-[#625b7d] disabled:opacity-40">Revoke sessions</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && <EmptyRow colSpan={7} />}
                  </tbody>
                </table>
              </div>
              <Pagination result={userPagination} page={userPage} onPage={setUserPage} />
            </section>
          ) : section === 'organizations' ? (
            <section className="space-y-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Organizations</h2>
                  <p className="mt-1 text-sm text-[#827d96]">Organizations are represented by isolated workspaces.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <SearchBox value={query} onChange={updateQuery} placeholder="Search organizations" />
                  <StatusFilter value={statusFilter} onChange={updateStatusFilter} />
                </div>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-[#e7e2f1] bg-white shadow-[0_2px_8px_rgba(47,37,84,0.05)]">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-[#faf9fd] text-xs uppercase tracking-wide text-[#8d879f]">
                    <tr><th className="px-5 py-3">Organization</th><th className="px-5 py-3">Owner</th><th className="px-5 py-3">Members</th><th className="px-5 py-3">Projects</th><th className="px-5 py-3">Documents</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eef5]">
                    {workspaces.map((workspace) => (
                      <tr key={workspace.id} className="transition-colors hover:bg-violet-50/50">
                        <td className="px-5 py-4"><p className="font-semibold">{workspace.name}</p><p className="mt-0.5 text-xs text-[#8d879f]">{workspace.slug}</p></td>
                        <td className="px-5 py-4">{workspace.members[0]?.user.name ?? 'No owner record'}<p className="mt-0.5 text-xs text-[#8d879f]">{workspace.members[0]?.user.email}</p></td>
                        <td className="px-5 py-4">{workspace._count.members}</td>
                        <td className="px-5 py-4">{workspace._count.projects}</td>
                        <td className="px-5 py-4">{workspace._count.documents}</td>
                        <td className="px-5 py-4"><StatusBadge status={workspace.isSuspended ? 'suspended' : 'active'} label={workspace.isSuspended ? 'Suspended' : 'Active'} /></td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => void toggleWorkspaceSuspension(workspace)}
                            disabled={pendingWorkspaceId === workspace.id}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                              workspace.isSuspended
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {pendingWorkspaceId === workspace.id ? 'Saving…' : workspace.isSuspended ? 'Restore' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {workspaces.length === 0 && <EmptyRow colSpan={7} />}
                  </tbody>
                </table>
              </div>
              <Pagination result={workspacePagination} page={workspacePage} onPage={setWorkspacePage} />
            </section>
          ) : section === 'monitoring' ? (
            <section className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">System monitoring</h2>
                <p className="mt-1 text-sm text-[#827d96]">Live service health and process metrics. Unknown metrics are shown as unavailable.</p>
              </div>
              <MonitoringPanel monitoring={monitoring} />
            </section>
          ) : (
            <section className="space-y-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Audit logs</h2>
                  <p className="mt-1 text-sm text-[#827d96]">Administrative security and access changes recorded by the platform.</p>
                </div>
                <SearchBox value={query} onChange={updateQuery} placeholder="Search audit events" />
              </div>
              {auditError && (
                <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {auditError}
                </div>
              )}
              <div className="overflow-x-auto rounded-2xl border border-[#e7e2f1] bg-white shadow-[0_2px_8px_rgba(47,37,84,0.05)]">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#faf9fd] text-xs uppercase tracking-wide text-[#8d879f]">
                    <tr><th className="px-5 py-3">Time</th><th className="px-5 py-3">Administrator</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Resource</th><th className="px-5 py-3">Result</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eef5]">
                    {auditLogs.map((entry) => (
                      <tr key={entry.id} className="transition-colors hover:bg-violet-50/50">
                        <td className="px-5 py-4 text-xs text-[#716a87]">{new Date(entry.createdAt).toLocaleString()}</td>
                        <td className="px-5 py-4 font-medium">{entry.actorEmail}</td>
                        <td className="px-5 py-4">{entry.action.replaceAll('_', ' ').toLowerCase()}</td>
                        <td className="px-5 py-4"><span className="text-xs text-[#938da5]">{entry.resourceType}</span><p className="max-w-56 truncate font-mono text-xs">{entry.resourceId}</p></td>
                        <td className="px-5 py-4"><StatusBadge status={entry.success ? 'active' : 'down'} label={entry.success ? 'Success' : 'Failed'} /></td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && <EmptyRow colSpan={5} />}
                  </tbody>
                </table>
              </div>
              <Pagination result={auditPagination} page={auditPage} onPage={setAuditPage} />
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  detail,
  tone,
}: {
  label: string
  value: number | string
  icon: typeof Users
  detail: string
  tone: 'violet' | 'green' | 'red' | 'blue'
}) {
  const tones = {
    violet: 'bg-violet-50 text-violet-600 ring-violet-100',
    green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    red: 'bg-rose-50 text-rose-600 ring-rose-100',
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
  }
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value
  return (
    <div className="rounded-2xl border border-[#e8e3f2] bg-white p-5 shadow-[0_2px_8px_rgba(47,37,84,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_8px_20px_rgba(83,61,144,0.10)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#746e89]">{label}</span>
        <span className={`grid size-9 place-items-center rounded-xl ring-1 ring-inset ${tones[tone]}`}>
          <Icon className="size-[17px]" />
        </span>
      </div>
      <p className={`mt-2 font-bold tracking-tight text-[#211b3b] ${typeof value === 'string' && value.length > 10 ? 'text-lg' : 'text-3xl'}`}>{displayValue}</p>
      <p className="mt-1 text-xs text-[#918ba3]">{detail}</p>
    </div>
  )
}

function SeriesPanel({
  title,
  description,
  points,
  color,
  variant = 'line',
}: {
  title: string
  description: string
  points: SeriesPoint[]
  color: string
  variant?: 'line' | 'bar'
}) {
  const width = 720
  const height = 190
  const max = Math.max(1, ...points.map((point) => point.count))
  const coordinates = points.map((point, index) => {
    const x = points.length < 2 ? width / 2 : (index / (points.length - 1)) * width
    const y = height - (point.count / max) * (height - 24) - 12
    return `${x},${y}`
  }).join(' ')
  const first = points[0]?.bucket
  const last = points[points.length - 1]?.bucket
  return (
    <div className="rounded-2xl border border-[#e8e3f2] bg-white p-5 shadow-[0_2px_8px_rgba(47,37,84,0.05)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-[#817a95]">{description}</p>
        </div>
        <span className="rounded-lg bg-[#f3f1fa] px-2.5 py-1 text-xs font-semibold text-[#625b7d]">
          {points.reduce((sum, point) => sum + point.count, 0).toLocaleString()} total
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title} over time`} className="mt-5 h-52 w-full overflow-visible">
        {[0, 1, 2, 3].map((line) => {
          const y = 12 + line * ((height - 24) / 3)
          return <line key={line} x1="0" x2={width} y1={y} y2={y} stroke="#eeecf4" strokeDasharray="4 5" />
        })}
        {variant === 'bar' ? points.map((point, index) => {
          const barWidth = Math.max(2, (width / Math.max(points.length, 1)) * 0.58)
          const x = (index / Math.max(points.length, 1)) * width + (width / Math.max(points.length, 1) - barWidth) / 2
          const barHeight = (point.count / max) * (height - 24)
          return <rect key={point.bucket} x={x} y={height - 12 - barHeight} width={barWidth} height={barHeight} rx="3" fill={color} opacity="0.82" />
        }) : points.length > 0 && (
          <>
            <polygon points={`0,${height - 12} ${coordinates} ${width},${height - 12}`} fill={color} opacity="0.10" />
            <polyline points={coordinates} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            {points.length <= 31 && points.map((point, index) => {
              const x = points.length < 2 ? width / 2 : (index / (points.length - 1)) * width
              const y = height - (point.count / max) * (height - 24) - 12
              return <circle key={point.bucket} cx={x} cy={y} r="3" fill={color} />
            })}
          </>
        )}
      </svg>
      <div className="flex justify-between text-[11px] text-[#938da5]">
        <span>{first ? formatBucket(first) : 'No data'}</span>
        <span>{last ? formatBucket(last) : ''}</span>
      </div>
    </div>
  )
}

function RecentActivityPanel({ activity }: { activity: AdminAnalytics['recentActivity'] }) {
  return (
    <div className="rounded-2xl border border-[#e8e3f2] bg-white p-5 shadow-[0_2px_8px_rgba(47,37,84,0.05)] sm:p-6">
      <div className="flex items-center gap-2">
        <Activity className="size-5 text-violet-600" />
        <h3 className="text-lg font-semibold">Recent platform activity</h3>
      </div>
      <p className="mt-1 text-sm text-[#817a95]">Latest workspace activity across organizations</p>
      <div className="mt-4 divide-y divide-[#f0edf6]">
        {activity.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#302a46]">{item.name} <span className="font-normal text-[#746e89]">{item.action}</span></p>
              <p className="mt-0.5 truncate text-sm text-violet-700">{item.target}</p>
              <p className="mt-0.5 truncate text-xs text-[#938da5]">{item.workspace.name}</p>
            </div>
            <time className="shrink-0 text-xs text-[#938da5]" dateTime={item.createdAt}>
              {new Date(item.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </time>
          </div>
        ))}
        {activity.length === 0 && <p className="py-8 text-center text-sm text-[#817a95]">No activity has been recorded yet.</p>}
      </div>
    </div>
  )
}

function AlertsPanel({ monitoring }: { monitoring?: MonitoringStatus }) {
  const alerts: Array<{ title: string; detail: string; tone: 'red' | 'amber' }> = []
  if (monitoring) {
    if (monitoring.api.errors5xx > 0) {
      alerts.push({ title: 'API server errors', detail: `${monitoring.api.errors5xx.toLocaleString()} HTTP 5xx responses since process start`, tone: 'red' })
    }
    if ((monitoring.worker.queue?.failed ?? 0) > 0) {
      alerts.push({ title: 'Failed background jobs', detail: `${monitoring.worker.queue?.failed?.toLocaleString()} jobs in the failed queue`, tone: 'amber' })
    }
    for (const [label, status] of [
      ['API service', monitoring.api.status],
      ['PostgreSQL', monitoring.database.status],
      ['Redis', monitoring.redis.status],
      ['Realtime gateway', monitoring.websocket.status],
      ['Background worker', monitoring.worker.status],
      ['Background queue', monitoring.worker.queue?.status],
      ['MongoDB / GridFS', monitoring.mongo.status],
    ]) {
      if (status && status !== 'healthy' && status !== 'up' && status !== 'ok') {
        alerts.push({ title: `${label} ${status === 'degraded' ? 'degraded' : 'unavailable'}`, detail: 'The latest service health check did not report healthy.', tone: status === 'degraded' ? 'amber' : 'red' })
      }
    }
  }
  return (
    <div className="rounded-2xl border border-[#e8e3f2] bg-white p-5 shadow-[0_2px_8px_rgba(47,37,84,0.05)] sm:p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-5 text-amber-600" />
        <h3 className="text-lg font-semibold">Active alerts</h3>
      </div>
      <p className="mt-1 text-sm text-[#817a95]">Issues from current service and queue health</p>
      <div className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <div key={alert.title} className="flex items-start gap-3 rounded-xl bg-[#faf9fd] p-3.5">
            <AlertTriangle className={`mt-0.5 size-4 shrink-0 ${alert.tone === 'red' ? 'text-rose-600' : 'text-amber-600'}`} />
            <div>
              <p className="text-sm font-semibold text-[#302a46]">{alert.title}</p>
              <p className="mt-0.5 text-sm text-[#746e89]">{alert.detail}</p>
            </div>
            <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${alert.tone === 'red' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{alert.tone === 'red' ? 'High' : 'Medium'}</span>
          </div>
        ))}
        {monitoring && alerts.length === 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-5 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="size-5" /> No active service or queue alerts.
          </div>
        )}
        {!monitoring && <p className="py-8 text-center text-sm text-[#817a95]">Waiting for monitoring data.</p>}
      </div>
    </div>
  )
}

function formatBucket(bucket: string) {
  const date = new Date(bucket.length === 13 ? `${bucket}:00:00Z` : `${bucket}T00:00:00Z`)
  return bucket.length === 13
    ? date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', timeZone: 'UTC' })
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

function HealthPanel({ monitoring, expanded = false }: { monitoring?: MonitoringStatus; expanded?: boolean }) {
  const services = [
    { label: 'API service', status: monitoring?.api.status },
    { label: 'PostgreSQL database', status: monitoring?.database.status },
    { label: 'Redis', status: monitoring?.redis.status },
  ]
  return (
    <div className="rounded-2xl border border-[#e8e3f2] bg-white p-5 shadow-[0_2px_8px_rgba(47,37,84,0.05)] sm:p-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-semibold">Core services</h3>
          <p className="mt-1 text-xs text-[#938da5]">
            {monitoring ? `Last checked ${new Date(monitoring.checkedAt).toLocaleTimeString()}` : 'Waiting for service status'}
          </p>
        </div>
      </div>
      <div className={`mt-4 grid gap-3 ${expanded ? 'md:grid-cols-3' : 'sm:grid-cols-3'}`}>
        {services.map(({ label, status }) => (
          <div key={label} className="flex items-center justify-between rounded-xl border border-[#eeeaf6] bg-[#faf9ff] px-4 py-3">
            <span className="text-sm font-medium">{label}</span>
            <StatusBadge status={toBadgeStatus(status)} label={status === 'healthy' || status === 'up' || status === 'ok' ? 'Healthy' : undefined} />
          </div>
        ))}
      </div>
    </div>
  )
}

function MonitoringPanel({ monitoring }: { monitoring?: MonitoringStatus }) {
  if (!monitoring) return <HealthPanel monitoring={monitoring} expanded />
  const serviceRows = [
    { name: 'API', status: monitoring.api.status, latency: null },
    { name: 'PostgreSQL', status: monitoring.database.status, latency: monitoring.database.latencyMs },
    { name: 'Redis', status: monitoring.redis.status, latency: monitoring.redis.latencyMs },
    { name: 'Realtime gateway', status: monitoring.websocket.status, latency: monitoring.websocket.latencyMs },
    { name: 'Background worker', status: monitoring.worker.status, latency: monitoring.worker.latencyMs },
    { name: 'MongoDB / GridFS', status: monitoring.mongo.status, latency: null },
  ]
  const apiMetrics: Array<[string, string]> = [
    ['Requests', monitoring.api.requestCount.toLocaleString()],
    ['Request rate', `${monitoring.api.requestsPerSecond.toLocaleString()} / sec`],
    ['Average latency', formatMetric(monitoring.api.averageLatencyMs, ' ms')],
    ['P95 latency', formatMetric(monitoring.api.p95LatencyMs, ' ms')],
    ['P99 latency', formatMetric(monitoring.api.p99LatencyMs, ' ms')],
    ['Error rate', `${monitoring.api.errorRate}%`],
  ]
  const infrastructure: Array<[string, string]> = [
    ['Process memory', formatBytes(monitoring.infrastructure.processMemoryBytes.rss)],
    ['Heap used', formatBytes(monitoring.infrastructure.processMemoryBytes.heapUsed)],
    ['Database size', formatBytes(monitoring.database.databaseBytes)],
    ['Redis memory', formatBytes(monitoring.redis.usedMemoryBytes)],
    ['File storage', formatBytes(monitoring.mongo.totalBytes)],
    ['Stored files', monitoring.mongo.fileCount?.toLocaleString() ?? 'Unavailable'],
    ['Active DB connections', monitoring.database.activeConnections?.toLocaleString() ?? 'Unavailable'],
    ['Redis clients', monitoring.redis.connectedClients?.toLocaleString() ?? 'Unavailable'],
  ]
  const queueCounts = monitoring.worker.queue
    ? Object.entries(monitoring.worker.queue).filter(([label, count]) => label !== 'status' && typeof count === 'number')
    : []
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {serviceRows.map((service) => (
          <div key={service.name} className="flex items-center justify-between rounded-2xl border border-[#e8e5f2] bg-white p-5">
            <div>
              <p className="font-semibold">{service.name}</p>
              <p className="mt-1 text-xs text-[#938da5]">{service.latency === null ? 'Health probe' : `${service.latency} ms response time`}</p>
            </div>
            <StatusBadge status={toBadgeStatus(service.status)} label={service.status === 'healthy' || service.status === 'up' || service.status === 'ok' ? 'Healthy' : undefined} />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <MetricGroup title="API performance" detail={monitoring.api.sampleWindow} items={apiMetrics} />
        <MetricGroup title="Infrastructure and storage" detail="Current process and connected storage metrics" items={infrastructure} />
      </div>
      <div className="rounded-2xl border border-[#e8e5f2] bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Background queue</h3>
        <p className="mt-1 text-xs text-[#938da5]">Worker status: {monitoring.worker.queue?.status ?? monitoring.worker.status}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {queueCounts.map(([label, count]) => (
            <div key={label} className="rounded-xl bg-[#faf9fd] p-4">
              <p className="text-xs capitalize text-[#827d96]">{label}</p>
              <p className="mt-1 text-xl font-semibold">{Number(count).toLocaleString()}</p>
            </div>
          ))}
          {queueCounts.length === 0 && <p className="col-span-full text-sm text-[#938da5]">Queue metrics unavailable.</p>}
        </div>
      </div>
      <p className="text-right text-xs text-[#938da5]">Snapshot checked {new Date(monitoring.checkedAt).toLocaleString()}</p>
    </div>
  )
}

function MetricGroup({ title, detail, items }: { title: string; detail: string; items: Array<[string, string]> }) {
  return (
    <div className="rounded-2xl border border-[#e8e5f2] bg-white p-5 sm:p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-[#938da5]">{detail}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-[#faf9fd] p-4">
            <p className="text-xs text-[#827d96]">{label}</p>
            <p className="mt-1 break-words text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatMetric(value: number | null, suffix: string) {
  return value === null ? 'Unavailable' : `${value.toLocaleString()}${suffix}`
}

function formatBytes(bytes: number | null | undefined) {
  if (bytes == null || !Number.isFinite(bytes)) return 'Unavailable'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

function toBadgeStatus(status?: string): 'active' | 'suspended' | 'down' | 'degraded' | 'unknown' {
  if (status === 'healthy' || status === 'up' || status === 'ok') return 'active'
  if (status === 'degraded') return 'degraded'
  if (status === 'down') return 'down'
  if (status === 'unavailable') return 'unknown'
  return 'unknown'
}

function StatusBadge({ status, label }: { status: 'active' | 'suspended' | 'down' | 'degraded' | 'unknown'; label?: string }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700',
    suspended: 'bg-red-50 text-red-700',
    down: 'bg-red-50 text-red-700',
    degraded: 'bg-amber-50 text-amber-700',
    unknown: 'bg-gray-100 text-gray-600',
  }
  const labels = { active: 'Healthy', suspended: 'Suspended', down: 'Down', degraded: 'Degraded', unknown: 'Unavailable' }
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}>
    {status === 'active' ? <CheckCircle2 className="size-3" /> : status === 'suspended' || status === 'down' ? <XCircle className="size-3" /> : null}
    {label ?? labels[status]}
  </span>
}

function StatusFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} aria-label="Filter by status" className="h-10 rounded-lg border border-[#e4def3] bg-white px-3 text-sm text-[#625b7d] outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20">
      <option value="all">All statuses</option>
      <option value="active">Active</option>
      <option value="suspended">Suspended</option>
    </select>
  )
}

function Pagination<T>({ result, page, onPage }: { result: PageResult<T> | null; page: number; onPage: (page: number) => void }) {
  if (!result || result.totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-[#827d96]">
      <span>{result.total.toLocaleString()} records · page {page} of {result.totalPages}</span>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-lg border border-[#e5e1ef] bg-white px-3 py-2 disabled:opacity-40"><ChevronLeft className="size-4" /> Previous</button>
        <button type="button" onClick={() => onPage(Math.min(result.totalPages, page + 1))} disabled={page >= result.totalPages} className="inline-flex items-center gap-1 rounded-lg border border-[#e5e1ef] bg-white px-3 py-2 disabled:opacity-40">Next <ChevronRight className="size-4" /></button>
      </div>
    </div>
  )
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="relative block w-full sm:w-72">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a19bb2]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-[#e4def3] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
      />
    </label>
  )
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return <tr><td colSpan={colSpan} className="px-5 py-10 text-center text-sm text-[#938da5]">No matching records.</td></tr>
}
