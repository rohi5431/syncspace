'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { DocumentItem, ProjectItem } from '@/lib/demo-data'

export function CreateDocumentDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (document: DocumentItem) => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Team notes')
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = title.trim()
    if (!value) return
    onCreate({ id: `doc-${Date.now()}`, title: value, category, updatedAt: 'Created just now', author: 'Rohit Kumar', initials: 'RK', tone: 'slate' })
    setTitle('')
    setCategory('Team notes')
    onClose()
  }
  return <Modal open={open} onClose={onClose} title="Create a document" description="Start a new document in your workspace.">
    <form onSubmit={submit} className="flex flex-col gap-4"><div><label htmlFor="document-title" className="mb-1.5 block text-sm font-medium text-gray-700">Document name</label><input id="document-title" required autoComplete="off" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Project kickoff notes" className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></div><div><label htmlFor="document-category" className="mb-1.5 block text-sm font-medium text-gray-700">Category</label><select id="document-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"><option>Team notes</option><option>Product strategy</option><option>Marketing</option><option>Meeting notes</option></select></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Create document</Button></div></form>
  </Modal>
}

export function CreateProjectDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (project: ProjectItem) => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = title.trim()
    if (!value) return
    onCreate({ id: `project-${Date.now()}`, title: value, description: description.trim() || 'A new project for your team.', progress: 0, dueDate: 'No due date', members: ['RK'], tone: 'slate' })
    setTitle('')
    setDescription('')
    onClose()
  }
  return <Modal open={open} onClose={onClose} title="Create a project" description="Give a team initiative a clear place to move forward.">
    <form onSubmit={submit} className="flex flex-col gap-4"><div><label htmlFor="project-title" className="mb-1.5 block text-sm font-medium text-gray-700">Project name</label><input id="project-title" required autoComplete="off" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Customer onboarding" className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></div><div><label htmlFor="project-description" className="mb-1.5 block text-sm font-medium text-gray-700">Description <span className="font-normal text-gray-400">(optional)</span></label><textarea id="project-description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this project about?" className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Create project</Button></div></form>
  </Modal>
}

export function CreateWorkspaceDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = name.trim()
    if (!value) {
      setError('Enter a workspace name to continue.')
      return
    }
    onCreate(value)
    setName('')
    setError('')
    onClose()
  }
  return <Modal open={open} onClose={onClose} title="Create a workspace" description="Give your team a shared home to get started.">
    <form onSubmit={submit} className="flex flex-col gap-4"><div><label htmlFor="workspace-name" className="mb-1.5 block text-sm font-medium text-gray-700">Workspace name</label><input id="workspace-name" required autoComplete="off" value={name} onChange={(event) => { setName(event.target.value); setError('') }} aria-invalid={Boolean(error)} aria-describedby={error ? 'workspace-name-error' : undefined} placeholder="e.g. Northstar Studio" className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" />{error && <p id="workspace-name-error" className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>}</div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Create workspace</Button></div></form>
  </Modal>
}

export function PreviewDialog({ title, description, open, onClose }: { title: string; description: string; open: boolean; onClose: () => void }) {
  return <Modal open={open} onClose={onClose} title={title} description={description} size="md"><div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-sm leading-6 text-gray-600">This workspace preview is local to the current session. Live editing and shared updates are not part of Phase 1.</p></div><div className="mt-5 flex justify-end"><Button type="button" onClick={onClose} className="bg-indigo-600 text-white hover:bg-indigo-700">Done</Button></div></Modal>
}
