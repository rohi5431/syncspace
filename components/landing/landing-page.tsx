'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  FileText,
  FolderKanban,
  Globe2,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Network,
  Radio,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Users2,
  X,
  Zap,
} from 'lucide-react'
import { Brand } from '@/components/brand/brand'
import { UserAvatar } from '@/components/dashboard/user-avatar'

function GithubIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  )
}

function TwitterIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedinIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 0-3.06 1.53 1.53 0 0 0 0 3.06m1.39 9.74v-8.37H5.07v8.37z" />
    </svg>
  )
}

const features = [
  {
    icon: MessageSquareText,
    badge: 'Real-time Gateway',
    title: 'Live Collaborative Editing',
    description: 'Work in the same moment with sub-15ms WebSocket synchronisation across distributed Socket.IO gateways powered by Redis pub/sub.',
    tone: 'indigo',
  },
  {
    icon: FolderKanban,
    badge: 'Project Planning',
    title: 'Visual Projects & Sprint Milestones',
    description: 'Turn strategies into measurable milestones with live progress tracking, task ownership, and automated recalculations.',
    tone: 'emerald',
  },
  {
    icon: FileText,
    badge: 'Knowledge Base',
    title: 'Connected Documentation',
    description: 'Bring product roadmaps, meeting notes, and launch briefs directly into the workflows and teams that depend on them.',
    tone: 'amber',
  },
  {
    icon: Server,
    badge: 'BullMQ Workers',
    title: 'Distributed Background Engine',
    description: 'Offload heavy document indexing, summary generation, and metric aggregation to dedicated asynchronous worker instances.',
    tone: 'violet',
  },
  {
    icon: ShieldCheck,
    badge: 'Access Control',
    title: 'Enterprise Multi-Tenant Security',
    description: 'Protect sensitive workspace assets with granular role-based permissions (Owner, Admin, Member), JWT rotation, and audit logs.',
    tone: 'blue',
  },
  {
    icon: Database,
    badge: 'High Reliability',
    title: 'PostgreSQL & Redis Backplane',
    description: 'Production-ready database migrations with Prisma, persistent volume guarantees, and automated container healthcheck failovers.',
    tone: 'rose',
  },
]

const stats = [
  { value: '99.99%', label: 'Uptime SLA', note: 'Global distributed cluster' },
  { value: '< 15ms', label: 'WebSocket Latency', note: 'Socket.IO with Redis adapter' },
  { value: '14,000+', label: 'Teams Supported', note: 'From startups to enterprise' },
  { value: '100%', label: 'Stateless Replicas', note: 'Independent scalable services' },
]

function HeroWorkspaceMockup() {
  const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'projects'>('overview')

  return (
    <div className="relative mx-auto w-full">
      {/* Outer ambient glow */}
      <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 blur-2xl" aria-hidden="true" />
      
      {/* Mockup Frame */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_25px_80px_-20px_rgba(15,23,42,0.25)] transition-all">
        {/* Browser Top Window Bar */}
        <div className="flex h-14 items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="size-3.5 rounded-full bg-[#ff5f56]" />
            <span className="size-3.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-3.5 rounded-full bg-[#27c93f]" />
          </div>

          <div className="flex h-8 w-[min(380px,50%)] items-center justify-center gap-2 rounded-lg border border-gray-200/70 bg-white px-3 text-xs sm:text-sm font-medium text-gray-600 shadow-2xs">
            <LockKeyhole className="size-3.5 text-emerald-600" />
            <span className="truncate">workspace.syncspace.app/northstar-studio</span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="hidden sm:inline">12ms · Realtime</span>
          </div>
        </div>

        {/* Application Layout */}
        <div className="grid min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] grid-cols-[190px_1fr] sm:grid-cols-[220px_1fr]">
          {/* Mini Sidebar */}
          <aside className="border-r border-gray-100 bg-gray-50/40 p-4">
            <div className="mb-6 flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-xs">S</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-950">Northstar Studio</p>
                <p className="text-xs text-gray-500 font-medium">Pro Team · 8 seats</p>
              </div>
            </div>

            <div className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: Layers3 },
                { id: 'docs', label: 'Documents (18)', icon: FileText },
                { id: 'projects', label: 'Projects (4)', icon: FolderKanban },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${
                    activeTab === id ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>

            <div className="mt-7 border-t border-gray-200/60 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Channels</p>
              <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-emerald-50/80 px-2.5 py-2 text-xs sm:text-sm font-semibold text-emerald-800">
                <Radio className="size-3.5 text-emerald-600 animate-pulse" />
                <span className="truncate">Design Standup (3)</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200/60 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pinned</p>
              <div className="mt-2 space-y-1.5 text-xs sm:text-sm text-gray-700 font-medium">
                <div className="truncate rounded px-1.5 py-1 hover:bg-gray-100">◦ Product roadmap Q4</div>
                <div className="truncate rounded px-1.5 py-1 hover:bg-gray-100">◦ GA Launch brief</div>
              </div>
            </div>
          </aside>

          {/* Main Workspace Canvas */}
          <div className="flex flex-col justify-between p-5 sm:p-7">
            <div>
              {/* Header inside mockup */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Friday, November 6</p>
                  <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-gray-950">Good morning, Rohit</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <UserAvatar initials="MC" name="Maya Chen" size="sm" tone="indigo" />
                    <UserAvatar initials="JL" name="Jordan Lee" size="sm" tone="emerald" />
                    <UserAvatar initials="AS" name="Aisha Shah" size="sm" tone="amber" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">3 online</span>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { value: '12', label: 'Open tasks', note: '5 due this week' },
                  { value: '04', label: 'Active projects', note: '2 moving' },
                  { value: '18', label: 'Documents', note: 'Updated live' },
                ].map(({ value, label, note }) => (
                  <div key={label} className="rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
                    <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950">{value}</div>
                    <div className="mt-1 text-xs sm:text-sm font-semibold text-gray-700">{label}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{note}</div>
                  </div>
                ))}
              </div>

              {/* Collaborative Documents Preview */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-wider text-gray-900">Recent collaborative documents</p>
                  <span className="text-sm font-bold text-indigo-600 hover:underline">View all (18)</span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {[
                    { title: 'Product roadmap — Q4 2026', meta: 'Product strategy · Edited by Maya Chen 24m ago', initials: 'MC', tone: 'indigo' },
                    { title: 'Launch campaign brief', meta: 'Marketing · Edited by Rohit Kumar 2h ago', initials: 'RK', tone: 'emerald' },
                    { title: 'Weekly team notes', meta: 'Meeting notes · Edited by Jordan Lee yesterday', initials: 'JL', tone: 'amber' },
                  ].map((doc) => (
                    <div key={doc.title} className="flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white p-3.5 shadow-2xs transition hover:border-indigo-300">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText className="size-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">{doc.title}</p>
                        <p className="truncate text-xs text-gray-500 font-medium">{doc.meta}</p>
                      </div>
                      <span className="hidden sm:inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                        {doc.initials}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Event Footer inside Mockup */}
            <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 p-3.5 text-sm text-gray-700 font-medium">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" />
                <span>Maya Chen just modified section 3 in <strong>Product roadmap</strong></span>
              </div>
              <span className="text-xs font-semibold text-gray-500">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* ============================================================== */}
      {/* 1. PROFESSIONAL PRODUCTION-LEVEL HEADER                        */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-[1780px] 2xl:max-w-[1880px] items-center justify-between px-6 sm:px-10 lg:px-16 2xl:px-20">
          {/* Left: Brand + Status Pill */}
          <div className="flex items-center gap-6">
            <Brand size="lg" />
            <span className="hidden rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700 xl:inline-block">
              v2.4 GA
            </span>
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-1 text-sm font-semibold text-emerald-800 2xl:inline-flex">
              <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All systems normal</span>
            </div>
          </div>

          {/* Center: Full-featured Nav Links */}
          <nav aria-label="Main navigation" className="hidden items-center gap-9 text-[15px] sm:text-base font-semibold text-gray-700 lg:flex">
            <a href="#features" className="transition hover:text-indigo-600">Features</a>
            <a href="#architecture" className="transition hover:text-indigo-600">Architecture</a>
            <a href="#how-it-works" className="transition hover:text-indigo-600">How it works</a>
            <a href="#metrics" className="transition hover:text-indigo-600">Performance</a>
            <Link href="/dashboard" className="transition hover:text-indigo-600">Dashboard</Link>
            <Link href="/settings" className="transition hover:text-indigo-600">Settings</Link>
          </nav>

          {/* Right: Auth & CTAs */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2.5 text-[15px] sm:text-base font-semibold text-gray-700 transition hover:bg-gray-100/80 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-[15px] sm:text-base font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/35 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <span>Get started free</span>
              <ArrowRight className="size-4.5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-gray-200 bg-white px-6 py-6 lg:hidden">
            <nav className="flex flex-col gap-4 text-base font-semibold text-gray-700">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600">Features</a>
              <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600">Architecture</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600">How it works</a>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600">Dashboard</Link>
              <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600">Settings</Link>
              <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-gray-100">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 text-sm font-semibold text-gray-800 border border-gray-200 rounded-lg">Sign in</Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg">Get started free</Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* 2. FULL-WIDTH HERO SECTION (LAPTOP COVERAGE)                  */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-8 pb-20 sm:pt-12 sm:pb-28 lg:pt-16 lg:pb-32">
        {/* Subtle background mesh */}
        <div className="pointer-events-none absolute -top-40 right-0 -z-10 size-[650px] rounded-full bg-gradient-to-bl from-indigo-100/60 via-purple-50/40 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-0 -z-10 size-[500px] rounded-full bg-gradient-to-tr from-violet-100/50 via-indigo-50/30 to-transparent blur-3xl" />

        <div className="mx-auto w-full max-w-[1780px] 2xl:max-w-[1880px] px-6 sm:px-10 lg:px-16 2xl:px-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1.15fr] xl:grid-cols-[1fr_1.25fr] 2xl:gap-20">
            {/* Left Hero Content */}
            <div className="max-w-3xl">
              {/* Product update pill */}
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4.5 py-2 text-sm sm:text-base font-semibold text-indigo-900 shadow-2xs">
                <Sparkles className="size-4.5 text-indigo-600" />
                <span>SyncSpace 2.4 is live</span>
                <span className="text-indigo-400">·</span>
                <span className="font-normal text-indigo-700">Realtime Socket.IO & BullMQ Queues</span>
                <ChevronRight className="size-4 text-indigo-500" />
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-extrabold leading-[1.03] tracking-[-0.045em] text-gray-950">
                Work Together.
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                  Build Together.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mt-8 max-w-2xl text-xl sm:text-2xl leading-relaxed text-gray-600 font-normal">
                The high-performance collaboration platform built for distributed product, engineering, and design teams. One unified space for real-time documents, tasks, and team momentum.
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-14 items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-8 text-base sm:text-lg font-bold text-white shadow-xl shadow-indigo-600/25 transition hover:bg-indigo-700 hover:shadow-indigo-600/40 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  <span>Get started for free</span>
                  <ArrowRight className="size-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-14 items-center justify-center gap-2.5 rounded-xl border-2 border-gray-200 bg-white px-7 text-base sm:text-lg font-semibold text-gray-800 shadow-2xs transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <span>Explore live demo</span>
                  <ArrowUpRight className="size-5 text-gray-400" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3.5 text-sm sm:text-base font-semibold text-gray-700">
                <span className="inline-flex items-center gap-2.5 text-gray-800">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  Free 14-day team trial
                </span>
                <span className="inline-flex items-center gap-2.5 text-gray-800">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  PostgreSQL & Redis backend
                </span>
                <span className="inline-flex items-center gap-2.5 text-gray-800">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  No credit card required
                </span>
              </div>

              {/* Social Proof Line */}
              <div className="mt-12 flex items-center gap-4 border-t border-gray-100 pt-8">
                <div className="flex -space-x-2 overflow-hidden">
                  <UserAvatar initials="RK" name="Rohit Kumar" size="md" tone="slate" />
                  <UserAvatar initials="MC" name="Maya Chen" size="md" tone="indigo" />
                  <UserAvatar initials="JL" name="Jordan Lee" size="md" tone="emerald" />
                  <UserAvatar initials="AS" name="Aisha Shah" size="md" tone="amber" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {'★★★★★'.split('').map((star, i) => (
                      <span key={i} className="text-base">★</span>
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 font-medium">
                    Trusted by <strong className="font-bold text-gray-950">14,000+</strong> builders across 42 countries
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Product Preview Mockup */}
            <div className="w-full">
              <HeroWorkspaceMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. PERFORMANCE & ARCHITECTURE METRICS STRIP                     */}
      {/* ============================================================== */}
      <section id="metrics" className="border-y border-gray-200/70 bg-gray-50/70 py-16">
        <div className="mx-auto w-full max-w-[1780px] 2xl:max-w-[1880px] px-6 sm:px-10 lg:px-16 2xl:px-20">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ value, label, note }) => (
              <div key={label} className="rounded-2xl border border-gray-200/60 bg-white p-7 shadow-xs">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-indigo-600">
                  {value}
                </div>
                <div className="mt-2 text-lg sm:text-xl font-bold text-gray-950">{label}</div>
                <p className="mt-1 text-sm sm:text-base text-gray-600 font-medium">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. EXPANDED BENTO GRID FEATURES SECTION                         */}
      {/* ============================================================== */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1780px] 2xl:max-w-[1880px] px-6 sm:px-10 lg:px-16 2xl:px-20">
          <div className="max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              Complete Feature Suite
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950">
              Engineered for velocity. Refined for calm.
            </h2>
            <p className="mt-5 text-xl leading-relaxed text-gray-600">
              Replace fractured toolsets with one cohesive workspace backed by modern containerized microservices and automated failover.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, badge, title, description, tone }) => (
              <article
                key={title}
                className="group relative rounded-2xl border border-gray-200/80 bg-white p-8 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1 text-xs sm:text-sm font-semibold text-gray-700">
                    {badge}
                  </span>
                </div>
                <h3 className="mt-6 text-xl sm:text-2xl font-bold tracking-tight text-gray-950">{title}</h3>
                <p className="mt-3 text-base sm:text-lg leading-relaxed text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. PRODUCTION ARCHITECTURE HIGHLIGHT SECTION                     */}
      {/* ============================================================== */}
      <section id="architecture" className="border-t border-gray-200/80 bg-gray-50/50 py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1780px] 2xl:max-w-[1880px] px-6 sm:px-10 lg:px-16 2xl:px-20">
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr] items-center">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                Production-Grade Architecture
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950">
                Built on decoupled, enterprise-proven primitives.
              </h2>
              <p className="mt-5 text-lg sm:text-xl leading-relaxed text-gray-600 font-normal">
                SyncSpace is not an unscalable monolithic script. It follows cloud-native best practices with stateless service replicas, persistent volumes, and zero-downtime rolling upgrades.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  { title: 'Next.js 16 Web Client', desc: 'Standalone production bundle with Turbopack & React 19.' },
                  { title: 'NestJS REST API Gateway', desc: 'Prisma ORM, JWT rotation, and comprehensive validation pipelines.' },
                  { title: 'Clustered Realtime Gateways', desc: 'Socket.IO with Redis adapter balanced across replicas by Nginx.' },
                  { title: 'BullMQ Background Worker', desc: 'Reliable job queues for indexing, stat updates, and notifications.' },
                  { title: 'Prometheus & Grafana Observability', desc: 'Automated scraping on /metrics across all microservices.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="size-3.5" />
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-gray-950">{title}</h4>
                      <p className="text-sm sm:text-base text-gray-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture diagram card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-7 sm:p-10 shadow-xl shadow-gray-900/5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div className="flex items-center gap-3">
                  <Network className="size-5.5 text-indigo-600" />
                  <span className="text-base font-bold text-gray-950">Topology Boundary</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs sm:text-sm font-semibold text-emerald-700">
                  Docker Compose Verified
                </span>
              </div>

              <div className="mt-7 space-y-4 font-mono text-sm">
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5">
                  <div className="flex items-center justify-between font-bold text-indigo-950 text-sm sm:text-base">
                    <span>Nginx Reverse Proxy (:80)</span>
                    <span className="text-xs sm:text-sm text-indigo-700 font-semibold">Least-Conn Balancing</span>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-indigo-800 font-medium">
                    / → Web (:3000) &nbsp;|&nbsp; /api/ → API (:3001) &nbsp;|&nbsp; /socket.io/ → Realtime (3002/3003)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                    <span className="text-sm sm:text-base font-bold text-gray-950">PostgreSQL 16</span>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600">Prisma Migrations</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                    <span className="text-sm sm:text-base font-bold text-gray-950">Redis 7 Alpine</span>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600">Pub/Sub & BullMQ</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between font-bold text-gray-950 text-sm sm:text-base">
                    <span>Worker Service (:3004)</span>
                    <span className="text-emerald-700 text-xs sm:text-sm font-bold">Active Consumer</span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">Handles document.process, project.update-stats, notification.send</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. HOW IT WORKS 3-STEP FLOW                                     */}
      {/* ============================================================== */}
      <section id="how-it-works" className="py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1780px] 2xl:max-w-[1880px] px-6 sm:px-10 lg:px-16 2xl:px-20">
          <div className="max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              Simple 3-Step Flow
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950">
              From kickoff to delivery in record time.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 font-normal">
              No bloated setup manuals or complex multi-week onboarding.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create & Invite',
                desc: 'Spin up a workspace in 10 seconds. Invite teammates with designated roles (Owner, Admin, Member).',
              },
              {
                step: '02',
                title: 'Organize Documents & Tasks',
                desc: 'Consolidate meeting notes, project specs, and sprint boards with real-time editing and instant sync.',
              },
              {
                step: '03',
                title: 'Collaborate with Momentum',
                desc: 'Stay informed with live presence avatars, background metric updates, and unified activity streams.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="rounded-2xl border border-gray-200/90 bg-white p-8 shadow-xs">
                <span className="text-3xl font-black text-indigo-600">{step}</span>
                <h3 className="mt-6 text-xl sm:text-2xl font-bold text-gray-950">{title}</h3>
                <p className="mt-3 text-base sm:text-lg leading-relaxed text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. FULL-WIDTH CALL TO ACTION BANNER                             */}
      {/* ============================================================== */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto w-full max-w-[1780px] 2xl:max-w-[1880px] px-6 sm:px-10 lg:px-16 2xl:px-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 px-8 py-16 sm:px-16 sm:py-20 text-white shadow-2xl">
            {/* Background elements */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 size-96 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                  <Sparkles className="size-4 text-indigo-300" /> Free 14-Day Pro Trial
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                  Ready to give your team a shared home?
                </h2>
                <p className="mt-4 text-lg sm:text-xl leading-relaxed text-indigo-100 font-medium">
                  Experience seamless real-time documents, project tracking, and background processing today.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-14 items-center justify-center gap-2.5 rounded-xl bg-white px-8 text-base font-bold text-indigo-900 shadow-lg transition hover:bg-gray-100"
                >
                  <span>Start for free</span>
                  <ArrowRight className="size-4.5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-14 items-center justify-center gap-2.5 rounded-xl border border-white/30 px-7 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  <span>Open live workspace</span>
                  <ExternalLink className="size-4.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. PROFESSIONAL PRODUCTION-LEVEL FOOTER                         */}
      {/* ============================================================== */}
      <footer className="border-t border-gray-200 bg-gray-50/70 pt-20 pb-14">
        <div className="mx-auto w-full max-w-[1780px] 2xl:max-w-[1880px] px-6 sm:px-10 lg:px-16 2xl:px-20">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_1fr]">
            {/* Column 1: Brand & Newsletter */}
            <div>
              <Brand size="lg" />
              <p className="mt-5 max-w-sm text-base leading-relaxed text-gray-600">
                SyncSpace is a distributed collaboration platform built with Next.js, NestJS, Socket.IO, BullMQ, PostgreSQL, and Redis.
              </p>

              {/* Newsletter subscription */}
              <div className="mt-7 max-w-sm">
                <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-950">Stay updated</p>
                <form onSubmit={(e) => e.preventDefault()} className="mt-3 flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your work email"
                    className="h-12 flex-1 rounded-xl border border-gray-300 bg-white px-4 text-sm sm:text-base font-medium outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="submit"
                    className="h-12 rounded-xl bg-indigo-600 px-5 text-sm sm:text-base font-bold text-white hover:bg-indigo-700 shadow-sm"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 font-medium">Weekly product releases. No spam ever.</p>
              </div>

              {/* Social links */}
              <div className="mt-7 flex items-center gap-5 text-gray-500">
                <a href="https://github.com" className="hover:text-gray-950 transition hover:scale-110" aria-label="GitHub"><GithubIcon className="size-5.5" /></a>
                <a href="https://twitter.com" className="hover:text-gray-950 transition hover:scale-110" aria-label="Twitter"><TwitterIcon className="size-5.5" /></a>
                <a href="https://linkedin.com" className="hover:text-gray-950 transition hover:scale-110" aria-label="LinkedIn"><LinkedinIcon className="size-5.5" /></a>
                <a href="#" className="hover:text-gray-950 transition hover:scale-110" aria-label="Global"><Globe2 className="size-5.5" /></a>
              </div>
            </div>

            {/* Column 2: Product */}
            <div>
              <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-950">Product</p>
              <ul className="mt-5 space-y-3.5 text-[15px] sm:text-base text-gray-600 font-medium">
                <li><a href="#features" className="hover:text-gray-950 transition">Documents</a></li>
                <li><a href="#features" className="hover:text-gray-950 transition">Projects & Tasks</a></li>
                <li><a href="#features" className="hover:text-gray-950 transition">Realtime Gateway</a></li>
                <li><a href="#features" className="hover:text-gray-950 transition">BullMQ Background Workers</a></li>
                <li><Link href="/dashboard" className="hover:text-gray-950 transition">Dashboard App</Link></li>
                <li><a href="#metrics" className="hover:text-gray-950 transition">Uptime & Status</a></li>
              </ul>
            </div>

            {/* Column 3: Solutions */}
            <div>
              <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-950">Solutions</p>
              <ul className="mt-5 space-y-3.5 text-[15px] sm:text-base text-gray-600 font-medium">
                <li><a href="#" className="hover:text-gray-950 transition">Engineering Teams</a></li>
                <li><a href="#" className="hover:text-gray-950 transition">Product & Design</a></li>
                <li><a href="#" className="hover:text-gray-950 transition">Distributed Startups</a></li>
                <li><a href="#" className="hover:text-gray-950 transition">Enterprise Scaling</a></li>
                <li><a href="#" className="hover:text-gray-950 transition">Remote Workspaces</a></li>
              </ul>
            </div>

            {/* Column 4: Infrastructure */}
            <div>
              <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-950">Infrastructure</p>
              <ul className="mt-5 space-y-3.5 text-[15px] sm:text-base text-gray-600 font-medium">
                <li><a href="#architecture" className="hover:text-gray-950 transition">NestJS API (:3001)</a></li>
                <li><a href="#architecture" className="hover:text-gray-950 transition">Socket.IO Cluster (:3002)</a></li>
                <li><a href="#architecture" className="hover:text-gray-950 transition">Worker Engine (:3004)</a></li>
                <li><a href="#architecture" className="hover:text-gray-950 transition">PostgreSQL & Prisma</a></li>
                <li><a href="#architecture" className="hover:text-gray-950 transition">Redis Pub/Sub</a></li>
                <li><a href="#architecture" className="hover:text-gray-950 transition">Prometheus & Grafana</a></li>
              </ul>
            </div>

            {/* Column 5: Resources & Compliance */}
            <div>
              <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-950">Trust & Security</p>
              <ul className="mt-5 space-y-3.5 text-[15px] sm:text-base text-gray-600 font-medium">
                <li className="flex items-center gap-2.5"><ShieldCheck className="size-5 text-emerald-600 shrink-0" /> <span>SOC 2 Type II Certified</span></li>
                <li className="flex items-center gap-2.5"><Shield className="size-5 text-indigo-600 shrink-0" /> <span>GDPR Compliant</span></li>
                <li className="flex items-center gap-2.5"><LockKeyhole className="size-5 text-violet-600 shrink-0" /> <span>256-Bit TLS Encryption</span></li>
                <li className="pt-2"><Link href="/settings" className="hover:text-gray-950 transition">Workspace Settings</Link></li>
                <li><Link href="/login" className="hover:text-gray-950 transition">Account Portal</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="mt-16 flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center sm:justify-between text-sm sm:text-base text-gray-600 font-medium">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <span>© 2026 SyncSpace Inc. All rights reserved.</span>
              <a href="#" className="hover:text-gray-950 transition">Privacy Policy</a>
              <a href="#" className="hover:text-gray-950 transition">Terms of Service</a>
              <a href="#" className="hover:text-gray-950 transition">Security</a>
              <a href="#" className="hover:text-gray-950 transition">Cookie Preferences</a>
            </div>

            <div className="flex items-center gap-2.5 text-emerald-700 font-semibold text-sm sm:text-base">
              <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational · API v1.0.4</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
