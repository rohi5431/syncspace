'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Globe, Link2, Lock, Mail, Plus, Sparkles, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { DocumentSummary, ProjectSummary, TaskSummary, TeamMemberSummary } from './dashboard-types'
import { apiFetch } from '@/lib/api-client'

const EMPTY_PROJECTS: ProjectSummary[] = []
const EMPTY_TEAM_MEMBERS: TeamMemberSummary[] = []

// 1. CREATE DOCUMENT DIALOG
export function CreateDocumentDialog({
  open,
  onClose,
  onCreate,
  workspaceId,
  folderId,
  projectId,
}: {
  open: boolean
  onClose: () => void
  onCreate: (document: DocumentSummary) => void
  workspaceId?: string
  folderId?: string
  projectId?: string
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Product Strategy')
  const [type, setType] = useState('TECHNICAL_DOCUMENTATION')
  const [editor, setEditor] = useState('rich-text')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = title.trim()
    if (!value || saving) return
    setSaving(true)
    setError('')
    try {
      let targetWorkspaceId = workspaceId
      if (!targetWorkspaceId) {
        const storedWorkspace = localStorage.getItem('syncspace_workspace')
        if (!storedWorkspace) throw new Error('Select a workspace before creating a document')
        const activeWorkspace = JSON.parse(storedWorkspace) as { id?: string }
        if (!activeWorkspace.id) throw new Error('The active workspace is invalid')
        targetWorkspaceId = activeWorkspace.id
      }

      const response = await apiFetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: value, category, type, editor, workspaceId: targetWorkspaceId, folderId, projectId }),
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to create document')
      const document = await response.json()
      onCreate({
        id: document.id,
        title: document.title,
        category: document.category,
        authorName: document.authorName,
        initials: document.initials,
        tone: document.tone,
        updatedAt: 'Just now',
        collaborators: 1,
        accessLevel: 'Workspace Edit',
        starred: document.starred,
        type: document.type,
        editor: document.editor,
        folderId: document.folderId,
      })
      setTitle('')
      setCategory('Product Strategy')
      setType('TECHNICAL_DOCUMENTATION')
      setEditor('rich-text')
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create document')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Document" description="Start a live collaborative document with real-time sync.">
      <form onSubmit={submit} className="flex flex-col gap-4 text-gray-900">
        <div>
          <label htmlFor="doc-title" className="mb-1.5 block text-sm font-semibold text-gray-700">Document Title</label>
          <input
            id="doc-title"
            required
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Sprint Architecture Specification"
            className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-base outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        <div>
          <label htmlFor="doc-category" className="mb-1.5 block text-sm font-semibold text-gray-700">Workspace Category</label>
          <select
            id="doc-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-base outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          >
            <option>Product Strategy</option>
            <option>Engineering Specs</option>
            <option>Marketing Brief</option>
            <option>Meeting Notes</option>
            <option>Design Tokens & System</option>
          </select>
        </div>

        <div>
          <label htmlFor="doc-type" className="mb-1.5 block text-sm font-semibold text-gray-700">Document Type</label>
          <select
            id="doc-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-base outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          >
            <option value="SRS">Software Requirements Specification (SRS)</option>
            <option value="HLD">High-Level Design (HLD)</option>
            <option value="LLD">Low-Level Design (LLD)</option>
            <option value="API_DOCUMENTATION">API Documentation</option>
            <option value="DATABASE_DESIGN">Database Design</option>
            <option value="README">README.md</option>
            <option value="TECHNICAL_DOCUMENTATION">Technical Documentation</option>
            <option value="MEETING_NOTES">Meeting Notes</option>
            <option value="SPRINT_REPORT">Sprint Reports</option>
            <option value="RELEASE_NOTES">Release Notes</option>
            <option value="BUG_REPORT">Bug Reports</option>
            <option value="ARCHITECTURE_DIAGRAM">Architecture Diagrams</option>
          </select>
        </div>

        <div>
          <label htmlFor="doc-editor" className="mb-1.5 block text-sm font-semibold text-gray-700">Editor</label>
          <select
            id="doc-editor"
            value={editor}
            onChange={(event) => setEditor(event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-base outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          >
            <option value="rich-text">Collaborative Rich Text</option>
            <option value="markdown">Markdown</option>
            <option value="code">Code</option>
            <option value="diagram">Diagram Source</option>
          </select>
        </div>

        {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 py-2 font-medium">Cancel</Button>
          <Button type="submit" disabled={saving} className="rounded-xl bg-[#6C4CF1] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#5738D6]">
            {saving ? 'Creating…' : 'Create Document'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// 2. CREATE PROJECT DIALOG
export function CreateProjectDialog({
  open,
  onClose,
  onCreate,
  workspaceId,
}: {
  open: boolean
  onClose: () => void
  onCreate: (project: ProjectSummary) => void
  workspaceId?: string
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('Dec 15')
  const [tone, setTone] = useState<'indigo' | 'emerald' | 'amber' | 'pink'>('indigo')
  const [template, setTemplate] = useState('web-application-development')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const val = title.trim()
    if (!val || saving) return
    setSaving(true)
    setError('')
    try {
      const response = await apiFetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: val,
          description: description.trim(),
          dueDate: dueDate || 'No due date',
          tone,
          template,
          ...(workspaceId ? { workspaceId } : {}),
        }),
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to create project')
      const project = await response.json()
      onCreate({
        id: project.id,
        title: project.title,
        description: project.description,
        progress: project.progress,
        dueDate: project.dueDate,
        tone: project.tone,
        status: 'In Progress',
        members: Array.isArray(project.members) ? project.members : [],
        taskCount: project.tasks?.length ?? 0,
        template: project.template,
      })
      setTitle('')
      setDescription('')
      setTemplate('web-application-development')
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Project" description="Track team deliverables, task milestones, and progress.">
      <form onSubmit={submit} className="flex flex-col gap-4 text-gray-900">
        <div>
          <label htmlFor="proj-title" className="mb-1.5 block text-sm font-semibold text-gray-700">Project Name</label>
          <input
            id="proj-title"
            required
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Enterprise Gateway Migration"
            className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-base outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        <div>
          <label htmlFor="proj-desc" className="mb-1.5 block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            id="proj-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key objectives, deliverables, and team responsibilities..."
            className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        <div>
          <label htmlFor="proj-template" className="mb-1.5 block text-sm font-semibold text-gray-700">Project Template</label>
          <select
            id="proj-template"
            value={template}
            onChange={(event) => setTemplate(event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          >
            <option value="web-application-development">Web Application Development</option>
            <option value="full-stack-development">Full-Stack Development</option>
            <option value="backend-engineering">Backend Engineering</option>
            <option value="ai-ml-projects">AI/ML Projects</option>
            <option value="mobile-application-development">Mobile Application Development</option>
            <option value="devops-and-ci-cd">DevOps and CI/CD</option>
            <option value="database-engineering">Database Engineering</option>
            <option value="system-design-projects">System Design Projects</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="proj-due" className="mb-1.5 block text-sm font-semibold text-gray-700">Target Due Date</label>
            <input
              id="proj-due"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. Nov 30"
              className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Color Tone</label>
            <div className="flex items-center gap-2 pt-1.5">
              {[
                { tone: 'indigo', bg: 'bg-[#6C4CF1]' },
                { tone: 'emerald', bg: 'bg-[#16A34A]' },
                { tone: 'amber', bg: 'bg-[#F59E0B]' },
                { tone: 'pink', bg: 'bg-[#EC4899]' },
              ].map((item) => (
                <button
                  key={item.tone}
                  type="button"
                  onClick={() => setTone(item.tone as any)}
                  className={`size-8 rounded-full ${item.bg} transition ${
                    tone === item.tone ? 'ring-4 ring-gray-900/15 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Select ${item.tone} color`}
                />
              ))}
            </div>
          </div>
        </div>

        {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 py-2 font-medium">Cancel</Button>
          <Button type="submit" disabled={saving} className="rounded-xl bg-[#6C4CF1] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#5738D6]">
            {saving ? 'Creating…' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// 3. CREATE TASK DIALOG
export function CreateTaskDialog({
  open,
  onClose,
  onCreate,
  projectId,
  projects = EMPTY_PROJECTS,
  teamMembers = EMPTY_TEAM_MEMBERS,
}: {
  open: boolean
  onClose: () => void
  onCreate: (task: TaskSummary) => void
  projectId?: string
  projects?: ProjectSummary[]
  teamMembers?: TeamMemberSummary[]
}) {
  const [availableProjects, setAvailableProjects] = useState(projects)
  const [availableMembers, setAvailableMembers] = useState(teamMembers)
  const [title, setTitle] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? '')
  const [assignedTo, setAssignedTo] = useState('')
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')
  const [dueDate, setDueDate] = useState('Nov 18')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setAvailableProjects(projects)
    setAvailableMembers(teamMembers)
    if (projects.length > 0 && teamMembers.length > 0) return

    if (open) {
      apiFetch('/api/dashboard/summary')
        .then(async (response) => {
          if (!response.ok) throw new Error(await response.text() || 'Unable to load workspace members')
          return response.json()
        })
        .then((summary: { projects?: ProjectSummary[]; teamMembers?: TeamMemberSummary[] }) => {
          if (projects.length === 0) setAvailableProjects(summary.projects ?? [])
          if (teamMembers.length === 0) setAvailableMembers(summary.teamMembers ?? [])
        })
        .catch((loadError: unknown) => {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load workspace members')
        })
    }
  }, [open, projects, teamMembers])

  useEffect(() => {
    setSelectedProjectId(projectId ?? availableProjects[0]?.id ?? '')
  }, [projectId, availableProjects])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const val = title.trim()
    if (!val || saving) return
    setSaving(true)
    setError('')
    try {
      if (!selectedProjectId) throw new Error('Choose a project before creating the task')
      const response = await apiFetch(`/api/projects/${encodeURIComponent(selectedProjectId)}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: val,
          dueDate,
          priority: priority.toUpperCase(),
          ...(assignedTo ? { assignedTo } : {}),
        }),
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to create task')
      const createdTask = await response.json()
      const selectedMember = availableMembers.find((member) => member.id === assignedTo)
      const selectedProject = availableProjects.find((project) => project.id === selectedProjectId)
      onCreate({
        id: createdTask.id,
        title: val,
        projectName: selectedProject?.title ?? 'Project',
        projectTone: selectedProject?.tone ?? 'indigo',
        completed: false,
        dueDate: createdTask.dueDate ?? 'No due date',
        priority,
        assignee: selectedMember
          ? { name: selectedMember.name, initials: selectedMember.initials }
          : { name: 'Unassigned', initials: '--' },
      })
      setTitle('')
      setAssignedTo('')
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Task" description="Assign deliverables and track progress toward sprint goals.">
      <form onSubmit={submit} className="flex flex-col gap-4 text-gray-900">
        <div>
          <label htmlFor="task-title" className="mb-1.5 block text-sm font-semibold text-gray-700">Task Title</label>
          <input
            id="task-title"
            required
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Audit Redis pub/sub queue latency"
            className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-base outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-proj" className="mb-1.5 block text-sm font-semibold text-gray-700">Project</label>
            <select
              id="task-proj"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={Boolean(projectId)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
            >
              <option value="">Select a project</option>
              {availableProjects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="task-prio" className="mb-1.5 block text-sm font-semibold text-gray-700">Priority</label>
            <select
              id="task-prio"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
            >
              <option value="High">🔥 High Priority</option>
              <option value="Medium">⚡ Medium Priority</option>
              <option value="Low">🌱 Low Priority</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="task-assignee" className="mb-1.5 block text-sm font-semibold text-gray-700">Assign to team member</label>
          <select
            id="task-assignee"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          >
            <option value="">Unassigned</option>
            {availableMembers.map((member) => <option key={member.id} value={member.id}>{member.name} ({member.role})</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="task-due" className="mb-1.5 block text-sm font-semibold text-gray-700">Due Date</label>
          <input
            id="task-due"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="e.g. Nov 24"
            className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 py-2 font-medium">Cancel</Button>
          <Button type="submit" disabled={saving} className="rounded-xl bg-[#6C4CF1] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#5738D6]">
            {saving ? 'Creating…' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// 4. CREATE WORKSPACE DIALOG
export function CreateWorkspaceDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (workspace: { id: string; name: string; slug: string }) => void
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const val = name.trim()
    if (!val || saving) return
    setSaving(true)
    setError('')
    try {
      const response = await apiFetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: val }),
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to create workspace')
      const workspace = await response.json()
      onCreate(workspace)
      setName('')
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create workspace')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Workspace" description="Spin up an isolated team environment with dedicated document repositories.">
      <form onSubmit={submit} className="flex flex-col gap-4 text-gray-900">
        <div>
          <label htmlFor="ws-name" className="mb-1.5 block text-sm font-semibold text-gray-700">Workspace Name</label>
          <input
            id="ws-name"
            required
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apollo Ventures"
            className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-base outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-indigo-900">
          <p className="font-bold">What comes with this workspace:</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1 text-indigo-700">
            <li>Dedicated WebSocket collaboration cluster</li>
            <li>Prisma multi-tenant role isolation</li>
            <li>10 GB initial cloud asset storage</li>
          </ul>
        </div>

        <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 py-2 font-medium">Cancel</Button>
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          <Button type="submit" disabled={saving} className="rounded-xl bg-[#6C4CF1] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#5738D6]">
            {saving ? 'Creating…' : 'Create Workspace'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// 5. INVITE MEMBER DIALOG
export function InviteMemberDialog({
  open,
  onClose,
  onInvite,
}: {
  open: boolean
  onClose: () => void
  onInvite: (email: string, role: string) => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Editor')

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const val = email.trim()
    if (!val) return
    onInvite(val, role)
    setEmail('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite Teammate" description="Bring team members into your SyncSpace workspace.">
      <form onSubmit={submit} className="flex flex-col gap-4 text-gray-900">
        <div>
          <label htmlFor="invite-email" className="mb-1.5 block text-sm font-semibold text-gray-700">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 size-4 text-gray-400" />
            <input
              id="invite-email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="h-11 w-full rounded-xl border border-gray-200 pl-10 pr-3.5 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
            />
          </div>
        </div>

        <div>
          <label htmlFor="invite-role" className="mb-1.5 block text-sm font-semibold text-gray-700">Workspace Role</label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          >
            <option value="Admin">Admin – Can manage members & billing</option>
            <option value="Editor">Editor – Can create & edit documents</option>
            <option value="Viewer">Viewer – Read-only collaborator</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 py-2 font-medium">Cancel</Button>
          <Button type="submit" className="rounded-xl bg-[#6C4CF1] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#5738D6]">
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// 6. SHARE DOCUMENT DIALOG
export function ShareDocumentDialog({
  open,
  onClose,
  documentId,
  documentTitle,
}: {
  open: boolean
  onClose: () => void
  documentId: string
  documentTitle: string
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR')
  const [permissions, setPermissions] = useState<Array<{ email: string; role: string }>>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadPermissions = async () => {
    try {
      const response = await apiFetch(`/api/documents/${encodeURIComponent(documentId)}/permissions`)
      if (!response.ok) throw new Error(await response.text() || 'Unable to load permissions')
      setPermissions(await response.json())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load permissions')
    }
  }

  useEffect(() => {
    if (open) void loadPermissions()
  }, [open, documentId])

  const addPermission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || saving) return
    setSaving(true)
    setError('')
    try {
      const response = await apiFetch(`/api/documents/${encodeURIComponent(documentId)}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })
      if (!response.ok) throw new Error(await response.text() || 'Unable to update permissions')
      const permission = await response.json()
      setPermissions((previous) => [
        ...previous.filter((item) => item.email !== permission.email),
        permission,
      ])
      setEmail('')
    } catch (permissionError) {
      setError(permissionError instanceof Error ? permissionError.message : 'Unable to update permissions')
    } finally {
      setSaving(false)
    }
  }

  const removePermission = async (address: string) => {
    try {
      const response = await apiFetch(
        `/api/documents/${encodeURIComponent(documentId)}/permissions?email=${encodeURIComponent(address)}`,
        { method: 'DELETE' },
      )
      if (!response.ok) throw new Error(await response.text() || 'Unable to remove permission')
      setPermissions((previous) => previous.filter((item) => item.email !== address))
    } catch (permissionError) {
      setError(permissionError instanceof Error ? permissionError.message : 'Unable to remove permission')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Share Document" description={`Manage collaborative access for "${documentTitle}".`}>
      <div className="flex flex-col gap-4 text-gray-900">
        <form onSubmit={addPermission} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@example.com"
            className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 text-sm"
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as 'EDITOR' | 'VIEWER')}
            className="rounded-xl border border-gray-200 bg-white px-2 text-sm"
          >
            <option value="EDITOR">Can edit</option>
            <option value="VIEWER">Can view</option>
          </select>
          <Button type="submit" disabled={saving} className="rounded-xl bg-[#6C4CF1] px-4 text-white">
            {saving ? 'Saving…' : 'Share'}
          </Button>
        </form>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
          {permissions.map((permission) => (
            <div key={permission.email} className="flex items-center justify-between gap-3 p-3">
              <span className="truncate text-sm text-gray-700">{permission.email}</span>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs font-semibold text-gray-500">{permission.role === 'EDITOR' ? 'Can edit' : 'Can view'}</span>
                <button type="button" onClick={() => void removePermission(permission.email)} className="text-xs font-semibold text-red-600">Remove</button>
              </div>
            </div>
          ))}
          {permissions.length === 0 && <p className="p-3 text-sm text-gray-500">No individual permissions have been added.</p>}
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={onClose} className="rounded-xl bg-gray-900 px-5 text-white hover:bg-gray-800">Done</Button>
        </div>
      </div>
    </Modal>
  )
}

// 7. RENAME DOCUMENT DIALOG
export function RenameDocumentDialog({
  open,
  onClose,
  currentTitle,
  onRename,
}: {
  open: boolean
  onClose: () => void
  currentTitle: string
  onRename: (newTitle: string) => void
}) {
  const [title, setTitle] = useState(currentTitle)

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const val = title.trim()
    if (!val) return
    onRename(val)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Rename Document" description="Change the display title for this document.">
      <form onSubmit={submit} className="flex flex-col gap-4 text-gray-900">
        <div>
          <label htmlFor="rename-input" className="mb-1.5 block text-sm font-semibold text-gray-700">New Document Title</label>
          <input
            id="rename-input"
            required
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-base outline-none transition focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
          />
        </div>

        <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 py-2 font-medium">Cancel</Button>
          <Button type="submit" className="rounded-xl bg-[#6C4CF1] px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#5738D6]">
            Save Name
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// 8. PREVIEW DIALOG
export function PreviewDialog({
  open,
  onClose,
  title,
  description,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="md">
      <div className="rounded-2xl border border-gray-200 bg-[#F7F5FF] p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6C4CF1]">
          <Sparkles className="size-4" />
          <span>SyncSpace Live Document View</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 font-medium">
          Collaborative document synchronized across all connected peer instances. All edits propagate via WebSocket real-time cluster.
        </p>
      </div>
      <div className="mt-5 flex justify-end">
        <Button type="button" onClick={onClose} className="rounded-xl bg-[#6C4CF1] px-6 text-white hover:bg-[#5738D6]">
          Close
        </Button>
      </div>
    </Modal>
  )
}
