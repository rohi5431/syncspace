'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, CheckSquare2, FileText, FolderKanban, Plus, Sparkles } from 'lucide-react'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { ActivityFeed, DocumentCard, OnlineMembers, ProjectCard } from '@/components/dashboard/dashboard-cards'
import { CreateDocumentDialog, CreateProjectDialog, PreviewDialog } from '@/components/dashboard/create-dialogs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import { initialDocuments, initialProjects, type DocumentItem, type ProjectItem } from '@/lib/demo-data'

export function DashboardApp() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [documentOpen, setDocumentOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [documents, setDocuments] = useState(initialDocuments)
  const [projects, setProjects] = useState(initialProjects)
  const [preview, setPreview] = useState<{ title: string; description: string } | null>(null)
  const toast = useToast()

  useEffect(() => {
    const showHelp = () => toast('Help center content is coming in a future phase.')
    window.addEventListener('syncspace:help', showHelp)
    return () => window.removeEventListener('syncspace:help', showHelp)
  }, [toast])

  const openDocument = (document: DocumentItem) => setPreview({ title: document.title, description: `${document.category} · ${document.updatedAt}` })
  const openProject = (project: ProjectItem) => setPreview({ title: project.title, description: `${project.description} · ${project.progress}% complete` })

  return <div className="min-h-screen bg-white">
    <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    <div className="min-h-screen lg:pl-[264px]"><DashboardHeader onMenuClick={() => setMobileOpen(true)} documents={documents} projects={projects} />
      <main id="overview" className="mx-auto max-w-[1440px] px-4 pb-12 pt-7 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-medium text-gray-500">Friday, November 6, 2026</p><h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-gray-950 sm:text-[30px]">Good morning, Rohit</h1><p className="mt-2 text-sm text-gray-500">Here&apos;s what&apos;s happening across your workspace.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setProjectOpen(true)} className="h-10 rounded-lg border-gray-200 bg-white px-3.5 text-gray-700"><FolderKanban data-icon="inline-start" /> New project</Button><Button type="button" onClick={() => setDocumentOpen(true)} className="h-10 rounded-lg bg-indigo-600 px-3.5 text-white hover:bg-indigo-700"><Plus data-icon="inline-start" /> Create document</Button></div></div>

        <section aria-label="Workspace overview" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Active projects', value: '04', note: '2 moving this week', icon: FolderKanban },
            { label: 'Open tasks', value: '12', note: '5 due this week', icon: CheckSquare2 },
            { label: 'Shared documents', value: String(documents.length + 5).padStart(2, '0'), note: 'Updated recently', icon: FileText },
            { label: 'Team members', value: '08', note: '3 online right now', icon: Sparkles },
          ].map(({ label, value, note, icon: Icon }) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium text-gray-500">{label}</p><Icon aria-hidden="true" className="size-4 text-gray-400" /></div><div className="mt-3 flex items-end justify-between"><span className="text-[26px] font-semibold leading-none tracking-tight text-gray-950">{value}</span><span className="text-[10px] text-gray-400">{note}</span></div></div>)}
        </section>

        <section id="recent-documents" className="mt-9 scroll-mt-24"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-base font-semibold tracking-tight text-gray-950">Recent documents</h2><p className="mt-1 text-xs text-gray-500">Pick up where your team left off.</p></div><Link href="/dashboard#documents" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all <ArrowRight aria-hidden="true" className="size-3.5" /></Link></div><div id="documents" className="grid scroll-mt-24 gap-3 sm:grid-cols-2 xl:grid-cols-3">{documents.slice(0, 3).map((document) => <DocumentCard key={document.id} document={document} onOpen={openDocument} />)}{documents.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center sm:col-span-2 xl:col-span-3"><FileText className="mx-auto size-6 text-gray-300" /><p className="mt-3 text-sm font-medium text-gray-700">No documents yet</p><p className="mt-1 text-xs text-gray-500">Create your first document to get started.</p><Button type="button" onClick={() => setDocumentOpen(true)} className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700">Create document</Button></div>}</div></section>

        <section id="projects" className="mt-9 scroll-mt-24"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-base font-semibold tracking-tight text-gray-950">Recent projects</h2><p className="mt-1 text-xs text-gray-500">A quick look at what your team is building.</p></div><button type="button" onClick={() => setProjectOpen(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">New project <Plus aria-hidden="true" className="size-3.5" /></button></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{projects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} onOpen={openProject} />)}</div></section>

        <div className="mt-9 grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
          <section id="tasks" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-start justify-between"><div><h2 className="text-base font-semibold tracking-tight text-gray-950">Recent activity</h2><p className="mt-1 text-xs text-gray-500">The latest updates from your team.</p></div><button type="button" onClick={() => toast('You’re all caught up on workspace activity.')} className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900">See all <ArrowUpRight aria-hidden="true" className="size-3.5" /></button></div><div className="mt-3"><ActivityFeed /></div></section>
          <section id="team" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-start justify-between"><div><h2 className="text-base font-semibold tracking-tight text-gray-950">Team members</h2><p className="mt-1 text-xs text-gray-500">3 teammates are online.</p></div><button type="button" onClick={() => toast('Member invitations are available in the Members settings demo.')} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"><Plus aria-hidden="true" className="size-3.5" /> Invite</button></div><div className="mt-5"><OnlineMembers /></div></section>
        </div>
        <p className="mt-8 text-center text-[11px] text-gray-400">SyncSpace Phase 1 · Demo content stays in this browser session.</p>
      </main>
    </div>
    <CreateDocumentDialog open={documentOpen} onClose={() => setDocumentOpen(false)} onCreate={(document) => { setDocuments((current) => [document, ...current]); toast(`“${document.title}” added to your documents.`) }} />
    <CreateProjectDialog open={projectOpen} onClose={() => setProjectOpen(false)} onCreate={(project) => { setProjects((current) => [project, ...current]); toast(`“${project.title}” added to your projects.`) }} />
    <PreviewDialog open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.title ?? ''} description={preview?.description ?? ''} />
  </div>
}
