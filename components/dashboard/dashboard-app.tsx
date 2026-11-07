'use client'

import { useEffect, useState } from 'react'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardHeader } from './dashboard-header'
import { WelcomeSection } from './welcome-section'
import { DashboardStats } from './dashboard-stats'
import { QuickActions } from './quick-actions'
import { RecentDocuments } from './recent-documents'
import { MyTasks } from './my-tasks'
import { ProjectOverview } from './project-overview'
import { TeamCollaboration } from './team-collaboration'
import { ActivityTimeline } from './activity-feed'
import { UpcomingDeadlines } from './upcoming-deadlines'
import { WorkspaceUsage } from './workspace-usage'
import { CollaborationStatus } from './collaboration-status'
import { DashboardAnalytics } from './dashboard-analytics'
import { DashboardFooter } from './dashboard-footer'
import {
  CreateDocumentDialog,
  CreateProjectDialog,
  CreateTaskDialog,
  CreateWorkspaceDialog,
  InviteMemberDialog,
  PreviewDialog,
  RenameDocumentDialog,
  ShareDocumentDialog,
} from './create-dialogs'
import { useToast } from '@/components/providers/toast-provider'
import { apiFetch } from '@/lib/api-client'
import type { DashboardData, DocumentSummary, ProjectSummary, TaskSummary } from './dashboard-types'

// Default fallback data matching seeded database
const initialDashboardData: DashboardData = {
  workspace: {
    id: 'ws-northstar',
    name: 'Northstar Studio',
    slug: 'northstar-studio',
    plan: 'Pro Plan',
    seatQuota: 10,
    currentSeats: 4,
  },
  stats: {
    documents: { total: 18, trendPercent: '+14.2%', changeNote: 'vs previous 30 days' },
    projects: { total: 4, active: 3, completed: 1 },
    tasks: { total: 20, pending: 12, completed: 8, overdue: 2 },
    team: { total: 8, online: 3 },
  },
  recentDocuments: [
    {
      id: 'product-roadmap',
      title: 'Product roadmap — Q4 2026',
      category: 'Product Strategy',
      authorName: 'Maya Chen',
      initials: 'MC',
      tone: 'indigo',
      updatedAt: '24m ago',
      collaborators: 4,
      accessLevel: 'Workspace Edit',
      starred: true,
    },
    {
      id: 'launch-brief',
      title: 'Launch campaign brief',
      category: 'Marketing',
      authorName: 'Rohit Kumar',
      initials: 'RK',
      tone: 'emerald',
      updatedAt: '2h ago',
      collaborators: 3,
      accessLevel: 'Public View',
      starred: false,
    },
    {
      id: 'redis-architecture',
      title: 'Distributed Redis Pub/Sub Spec',
      category: 'Engineering Specs',
      authorName: 'Jordan Lee',
      initials: 'JL',
      tone: 'amber',
      updatedAt: 'Yesterday',
      collaborators: 5,
      accessLevel: 'Workspace Edit',
      starred: true,
    },
    {
      id: 'design-tokens',
      title: 'SyncSpace 2.4 Design System Tokens',
      category: 'Design Tokens & System',
      authorName: 'Aisha Shah',
      initials: 'AS',
      tone: 'pink',
      updatedAt: '2 days ago',
      collaborators: 2,
      accessLevel: 'Workspace Edit',
      starred: false,
    },
    {
      id: 'customer-interviews',
      title: 'Customer Discovery: Enterprise Realtime',
      category: 'Product Strategy',
      authorName: 'Rohit Kumar',
      initials: 'RK',
      tone: 'indigo',
      updatedAt: '3 days ago',
      collaborators: 2,
      accessLevel: 'Restricted',
      starred: false,
    },
    {
      id: 'security-audit',
      title: 'SOC 2 Type II Compliance Checklist',
      category: 'Engineering Specs',
      authorName: 'Jordan Lee',
      initials: 'JL',
      tone: 'slate',
      updatedAt: '5 days ago',
      collaborators: 4,
      accessLevel: 'Restricted',
      starred: false,
    },
  ],
  projects: [
    {
      id: 'p-website-refresh',
      title: 'Website refresh & Design System',
      description: 'Comprehensive redesign with soft lavender backdrop and high-contrast typography.',
      progress: 68,
      dueDate: 'Nov 18',
      tone: 'indigo',
      status: 'In Progress',
      members: ['MC', 'JL', 'RK'],
      taskCount: 8,
    },
    {
      id: 'p-mobile-v2',
      title: 'Mobile app v2 Beta',
      description: 'Native mobile client with background WebSocket synchronization and offline-first caches.',
      progress: 42,
      dueDate: 'Dec 02',
      tone: 'emerald',
      status: 'In Progress',
      members: ['AS', 'RK'],
      taskCount: 6,
    },
    {
      id: 'p-realtime-infra',
      title: 'Realtime Infrastructure Cluster',
      description: 'High-throughput Socket.IO clustering across multiple availability zones with Redis adapter.',
      progress: 85,
      dueDate: 'Nov 12',
      tone: 'amber',
      status: 'On Track',
      members: ['JL', 'MC'],
      taskCount: 5,
    },
    {
      id: 'p-brand-overhaul',
      title: 'Brand visual identity',
      description: 'Unified icon system, brand style guide, marketing collateral, and production tokens.',
      progress: 100,
      dueDate: 'Oct 28',
      tone: 'pink',
      status: 'Completed',
      members: ['MC', 'AS'],
      taskCount: 4,
    },
  ],
  tasks: [
    {
      id: 't-1',
      title: 'Audit Redis pub/sub queue latency under 10k connections',
      projectName: 'Realtime Infrastructure',
      projectTone: 'amber',
      completed: false,
      dueDate: 'Nov 7',
      priority: 'High',
      assignee: { name: 'Jordan Lee', initials: 'JL' },
    },
    {
      id: 't-2',
      title: 'Implement collapsible sidebar with icon rail mode',
      projectName: 'Website refresh',
      projectTone: 'indigo',
      completed: true,
      dueDate: 'Nov 6',
      priority: 'High',
      assignee: { name: 'Rohit Kumar', initials: 'RK' },
    },
    {
      id: 't-3',
      title: 'Configure JWT session cookies and proxy rewrite',
      projectName: 'Website refresh',
      projectTone: 'indigo',
      completed: true,
      dueDate: 'Nov 6',
      priority: 'Medium',
      assignee: { name: 'Rohit Kumar', initials: 'RK' },
    },
    {
      id: 't-4',
      title: 'Update dark/light design tokens for soft lavender palette',
      projectName: 'Website refresh',
      projectTone: 'indigo',
      completed: false,
      dueDate: 'Nov 9',
      priority: 'Medium',
      assignee: { name: 'Maya Chen', initials: 'MC' },
    },
    {
      id: 't-5',
      title: 'Profile WebSocket reconnection backoff on packet drop',
      projectName: 'Realtime Infrastructure',
      projectTone: 'amber',
      completed: false,
      dueDate: 'Nov 11',
      priority: 'High',
      assignee: { name: 'Jordan Lee', initials: 'JL' },
    },
    {
      id: 't-6',
      title: 'Review user feedback on document commenting feature',
      projectName: 'Mobile app v2',
      projectTone: 'emerald',
      completed: false,
      dueDate: 'Nov 14',
      priority: 'Low',
      assignee: { name: 'Aisha Shah', initials: 'AS' },
    },
  ],
  activities: [
    {
      id: 'a-1',
      name: 'Maya Chen',
      initials: 'MC',
      tone: 'indigo',
      action: 'updated specification',
      target: 'Product roadmap — Q4 2026',
      createdAt: '12m ago',
      category: 'document',
    },
    {
      id: 'a-2',
      name: 'Jordan Lee',
      initials: 'JL',
      tone: 'emerald',
      action: 'completed deliverable in',
      target: 'Website refresh',
      createdAt: '45m ago',
      category: 'task',
    },
    {
      id: 'a-3',
      name: 'Aisha Shah',
      initials: 'AS',
      tone: 'amber',
      action: 'shared document',
      target: 'SyncSpace 2.4 Design System Tokens',
      createdAt: '2h ago',
      category: 'document',
    },
    {
      id: 'a-4',
      name: 'Rohit Kumar',
      initials: 'RK',
      tone: 'indigo',
      action: 'created new project',
      target: 'Realtime Infrastructure Cluster',
      createdAt: '4h ago',
      category: 'project',
    },
  ],
  teamMembers: [
    {
      id: 'u-1',
      name: 'Maya Chen',
      email: 'maya@northstar.co',
      initials: 'MC',
      role: 'Staff Product Designer',
      tone: 'indigo',
      online: true,
      lastActive: 'Active now',
    },
    {
      id: 'u-2',
      name: 'Jordan Lee',
      email: 'jordan@northstar.co',
      initials: 'JL',
      role: 'Lead Infrastructure Engineer',
      tone: 'emerald',
      online: true,
      lastActive: 'Active now',
    },
    {
      id: 'u-3',
      name: 'Aisha Shah',
      email: 'aisha@northstar.co',
      initials: 'AS',
      role: 'Principal Product Manager',
      tone: 'amber',
      online: true,
      lastActive: 'Active now',
    },
    {
      id: 'u-4',
      name: 'Rohit Kumar',
      email: 'rohit@northstar.co',
      initials: 'RK',
      role: 'Workspace Owner',
      tone: 'indigo',
      online: false,
      lastActive: '15m ago',
    },
  ],
  storage: {
    usedBytes: 1288490188,
    totalBytes: 10737418240,
    usedFormatted: '1.2 GB',
    totalFormatted: '10 GB',
    percent: 12,
  },
  collaboration: {
    status: 'Operational',
    latencyMs: 14,
    gatewayUrl: 'ws://localhost:3002',
    activeRooms: 4,
    connectedClients: 8,
    synced: true,
  },
}

export function DashboardApp() {
  const [data, setData] = useState<DashboardData>(initialDashboardData)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeHash, setActiveHash] = useState('#overview')
  const [userName, setUserName] = useState('Rohit')

  // Dialog states
  const [documentOpen, setDocumentOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [shareDoc, setShareDoc] = useState<DocumentSummary | null>(null)
  const [renameDoc, setRenameDoc] = useState<DocumentSummary | null>(null)
  const [preview, setPreview] = useState<{ title: string; description: string } | null>(null)

  const toast = useToast()

  // 1. Fetch live backend summary or fallback
  useEffect(() => {
    try {
      const stored = localStorage.getItem('syncspace_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.name) {
          setUserName(parsed.name.split(' ')[0])
        }
      }
    } catch {
      // fallback
    }

    const fetchSummary = async () => {
      try {
        const res = await apiFetch('/api/dashboard/summary')
        if (res.ok) {
          const json = await res.json()
          if (json && json.stats) {
            setData((prev) => ({
              ...prev,
              ...json,
            }))
          }
        }
      } catch {
        // use initial fallback
      }
    }

    fetchSummary()
  }, [])

  // 2. Hash navigation watcher
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        setActiveHash(window.location.hash)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId)
    if (target) {
      target.scrollIntoView({ behavior: 'auto' })
      setActiveHash(`#${sectionId}`)
    }
  }

  // Document actions
  const handleToggleStar = (docId: string) => {
    setData((prev) => ({
      ...prev,
      recentDocuments: prev.recentDocuments.map((d) =>
        d.id === docId ? { ...d, starred: !d.starred } : d,
      ),
    }))
  }

  const handleCreateDocument = (doc: DocumentSummary) => {
    setData((prev) => ({
      ...prev,
      recentDocuments: [doc, ...prev.recentDocuments],
      stats: {
        ...prev.stats,
        documents: {
          ...prev.stats.documents,
          total: prev.stats.documents.total + 1,
        },
      },
    }))
    toast(`“${doc.title}” created successfully.`)
  }

  const handleRenameDocument = (newTitle: string) => {
    if (!renameDoc) return
    setData((prev) => ({
      ...prev,
      recentDocuments: prev.recentDocuments.map((d) =>
        d.id === renameDoc.id ? { ...d, title: newTitle } : d,
      ),
    }))
    toast(`Document renamed to “${newTitle}”.`)
  }

  // Project actions
  const handleCreateProject = (project: ProjectSummary) => {
    setData((prev) => ({
      ...prev,
      projects: [project, ...prev.projects],
      stats: {
        ...prev.stats,
        projects: {
          ...prev.stats.projects,
          total: prev.stats.projects.total + 1,
          active: (prev.stats.projects.active || 0) + 1,
        },
      },
    }))
    toast(`“${project.title}” added to projects.`)
  }

  // Task actions
  const handleCreateTask = (task: TaskSummary) => {
    setData((prev) => ({
      ...prev,
      tasks: [task, ...prev.tasks],
      stats: {
        ...prev.stats,
        tasks: {
          ...prev.stats.tasks,
          total: prev.stats.tasks.total + 1,
          pending: (prev.stats.tasks.pending || 0) + 1,
        },
      },
    }))
    toast(`“${task.title}” created.`)
  }

  const handleToggleTask = (taskId: string) => {
    setData((prev) => {
      const updated = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      )
      const pendingCount = updated.filter((t) => !t.completed).length
      const completedCount = updated.filter((t) => t.completed).length
      return {
        ...prev,
        tasks: updated,
        stats: {
          ...prev.stats,
          tasks: {
            ...prev.stats.tasks,
            pending: pendingCount,
            completed: completedCount,
          },
        },
      }
    })
  }

  // Workspace actions
  const handleCreateWorkspace = (workspace: { id: string; name: string; slug: string }) => {
    localStorage.setItem('syncspace_workspace', JSON.stringify(workspace))
    setData((prev) => ({
      ...prev,
      workspace: {
        ...prev.workspace,
        ...workspace,
      },
    }))
    apiFetch(`/api/dashboard/summary?workspace=${encodeURIComponent(workspace.id)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text() || 'Unable to load the new workspace')
        return response.json()
      })
      .then((summary: DashboardData) => setData((previous) => ({ ...previous, ...summary })))
      .catch((error: unknown) => {
        toast(error instanceof Error ? `Workspace created, but its summary could not be loaded: ${error.message}` : 'Workspace created, but its summary could not be loaded.')
      })
    toast(`Workspace “${workspace.name}” is now active.`)
  }

  // Member invite action
  const handleInviteMember = (email: string, role: string) => {
    const initials = email.slice(0, 2).toUpperCase()
    setData((prev) => ({
      ...prev,
      teamMembers: [
        {
          id: `u-${Date.now()}`,
          name: email.split('@')[0],
          email,
          initials,
          role,
          tone: 'indigo',
          online: false,
          lastActive: 'Invited just now',
        },
        ...prev.teamMembers,
      ],
      stats: {
        ...prev.stats,
        team: {
          ...prev.stats.team,
          total: prev.stats.team.total + 1,
        },
      },
    }))
    toast(`Invitation sent to ${email} as ${role}.`)
  }

  return (
    <div className="min-h-screen bg-[#F7F5FF] text-[#1F2937]">
      {/* 1. LEFT SIDEBAR */}
      <DashboardSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeHash={activeHash}
        onSelectNav={(hash) => {
          setActiveHash(hash)
          const targetId = hash.replace('#', '')
          navigateToSection(targetId)
        }}
      />

      {/* 2. MAIN LAYOUT AREA */}
      <div
        className={`min-h-screen transition-all duration-200 ${
          isSidebarCollapsed ? 'lg:pl-[78px]' : 'lg:pl-[288px]'
        }`}
      >
        {/* TOP HEADER */}
        <DashboardHeader
          onMenuClick={() => setMobileOpen(true)}
          documents={data.recentDocuments}
          projects={data.projects}
          tasks={data.tasks}
          workspaceName={data.workspace.name}
          onCreateDocument={() => setDocumentOpen(true)}
          onCreateProject={() => setProjectOpen(true)}
          onCreateTask={() => setTaskOpen(true)}
          onCreateWorkspace={() => setWorkspaceOpen(true)}
          onInviteMember={() => setInviteOpen(true)}
        />

        {/* MAIN DASHBOARD CONTENT */}
        <main
          id="overview"
          className="mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-10 xl:px-12 py-8 space-y-8"
        >
          {/* Welcome Section */}
          <WelcomeSection
            userName={userName}
            workspaceName={data.workspace.name}
            planName={data.workspace.plan}
            onCreateDocument={() => setDocumentOpen(true)}
            onCreateProject={() => setProjectOpen(true)}
            onInviteMember={() => setInviteOpen(true)}
          />

          {/* 4 KPI Summary Cards */}
          <DashboardStats
            stats={data.stats}
            onNavigateSection={navigateToSection}
          />

          {/* 6 Quick Actions Cards */}
          <QuickActions
            onCreateDocument={() => setDocumentOpen(true)}
            onCreateProject={() => setProjectOpen(true)}
            onCreateTask={() => setTaskOpen(true)}
            onInviteMember={() => setInviteOpen(true)}
            onCreateBoard={() => {
              navigateToSection('projects')
              toast('Opened Kanban view in Projects section.')
            }}
            onViewTeam={() => navigateToSection('team')}
          />

          {/* Recent Documents Table & Cards */}
          <RecentDocuments
            documents={data.recentDocuments}
            onOpenDocument={(doc) =>
              setPreview({
                title: doc.title,
                description: `${doc.category} · Updated ${doc.updatedAt} · ${doc.collaborators} collaborators`,
              })
            }
            onShareDocument={(doc) => setShareDoc(doc)}
            onRenameDocument={(doc) => setRenameDoc(doc)}
            onToggleStar={handleToggleStar}
            onCreateDocument={() => setDocumentOpen(true)}
          />

          {/* Grid: Tasks & Upcoming Deadlines */}
          <div className="grid gap-8 lg:grid-cols-2">
            <MyTasks
              tasks={data.tasks}
              onToggleTask={handleToggleTask}
              onCreateTask={() => setTaskOpen(true)}
            />
            <UpcomingDeadlines
              onViewCalendar={() => toast('Calendar view is synchronized with your tasks and sprint milestones.')}
            />
          </div>

          {/* Active Projects */}
          <ProjectOverview
            projects={data.projects}
            onOpenProject={(proj) =>
              setPreview({
                title: proj.title,
                description: `${proj.description} (${proj.progress}% completed)`,
              })
            }
            onCreateProject={() => setProjectOpen(true)}
          />

          {/* Grid: Team Collaboration & Activity Feed */}
          <div className="grid gap-8 lg:grid-cols-2">
            <TeamCollaboration
              teamMembers={data.teamMembers}
              onInviteMember={() => setInviteOpen(true)}
            />
            <ActivityTimeline
              activities={data.activities}
              onOpenTarget={(target) => toast(`Navigating to ${target}...`)}
            />
          </div>

          {/* Grid: Storage & Real-Time Collaboration Status */}
          <div className="grid gap-8 lg:grid-cols-2">
            <WorkspaceUsage
              storage={data.storage}
              workspace={data.workspace}
            />
            <CollaborationStatus
              collaboration={data.collaboration}
            />
          </div>

          {/* Dashboard Analytics & Velocity Charts */}
          <DashboardAnalytics />

          {/* Footer */}
          <DashboardFooter />
        </main>
      </div>

      {/* 3. WORKING DIALOGS */}
      <CreateDocumentDialog
        open={documentOpen}
        onClose={() => setDocumentOpen(false)}
        onCreate={handleCreateDocument}
        workspaceId={data.workspace.id}
      />

      <CreateProjectDialog
        open={projectOpen}
        onClose={() => setProjectOpen(false)}
        onCreate={handleCreateProject}
        workspaceId={data.workspace.id}
      />

      <CreateTaskDialog
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        onCreate={handleCreateTask}
        projects={data.projects}
        teamMembers={data.teamMembers}
      />

      <CreateWorkspaceDialog
        open={workspaceOpen}
        onClose={() => setWorkspaceOpen(false)}
        onCreate={handleCreateWorkspace}
      />

      <InviteMemberDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInviteMember}
      />

      {shareDoc && (
        <ShareDocumentDialog
          open={Boolean(shareDoc)}
          onClose={() => setShareDoc(null)}
          documentId={shareDoc.id}
          documentTitle={shareDoc.title}
        />
      )}

      {renameDoc && (
        <RenameDocumentDialog
          open={Boolean(renameDoc)}
          onClose={() => setRenameDoc(null)}
          currentTitle={renameDoc.title}
          onRename={handleRenameDocument}
        />
      )}

      <PreviewDialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title ?? ''}
        description={preview?.description ?? ''}
      />
    </div>
  )
}
