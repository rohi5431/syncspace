'use client'

import { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  FileText,
  FolderKanban,
  HelpCircle,
  KeyRound,
  Mail,
  MessageSquare,
  Search,
  Sparkles,
  UserPlus,
  Users2,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'

interface HelpArticle {
  title: string
  desc: string
  category: string
  icon: any
}

const articles: HelpArticle[] = [
  {
    title: 'Getting Started with SyncSpace',
    desc: 'Learn the essentials of creating your workspace, inviting your team, and launching your first initiative.',
    category: 'Basics',
    icon: Sparkles,
  },
  {
    title: 'Real-Time Document Collaboration',
    desc: 'How multi-cursor synchronization, operational transformation, and conflict resolution keep teams aligned.',
    category: 'Documents',
    icon: FileText,
  },
  {
    title: 'Managing Sprints & Project Boards',
    desc: 'Set milestone targets, track velocity percentages, and structure your team’s deliverables.',
    category: 'Projects',
    icon: FolderKanban,
  },
  {
    title: 'Kanban & Calendar Task Workflows',
    desc: 'Switch between List, Kanban, and Deadlines views to prioritize high-urgency items.',
    category: 'Tasks',
    icon: Zap,
  },
  {
    title: 'Inviting Team Members & Roles',
    desc: 'Understand the permissions granted to Owners, Admins, and standard workspace Members.',
    category: 'Team',
    icon: UserPlus,
  },
  {
    title: 'Account Security & Two-Factor Auth',
    desc: 'Protecting your session cookies, revoking active logins, and managing enterprise single sign-on.',
    category: 'Security',
    icon: KeyRound,
  },
]

const faqs = [
  {
    q: 'How does real-time synchronization work in SyncSpace?',
    a: 'SyncSpace utilizes Socket.IO WebSocket connections tied to Redis Pub/Sub backends. Every keypress and cursor movement propagates across connected peer clients in under 30 milliseconds.',
  },
  {
    q: 'Can I export my documents to other formats?',
    a: 'Yes, documents can be shared as public view links, exported as Markdown (.md), or downloaded as structured JSON snapshots for backup.',
  },
  {
    q: 'What are the limits of the Pro Plan?',
    a: 'The Pro Plan provides up to 10 member seats, 10 GB of attachment storage, and unlimited active collaborative document rooms.',
  },
  {
    q: 'How do I invite teammates from other organizations?',
    a: 'Administrators can navigate to the Team Members page, click "Invite Member", and specify their email address and desired role (Admin or Member).',
  },
]

export function HelpCenterView() {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [contactSubject, setContactSubject] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const toast = useToast()

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()),
  )

  const handleContactSupport = (e: React.FormEvent) => {
    e.preventDefault()
    toast('Support ticket submitted. A SyncSpace engineer will reply via email shortly.')
    setContactSubject('')
    setContactMessage('')
  }

  return (
    <div className="space-y-10">
      {/* 1. Hero Search Header */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-white to-[#F7F5FF] p-8 sm:p-12 text-center shadow-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C4CF1]/10 px-3 py-1 text-xs font-bold text-[#6C4CF1]">
          <BookOpen className="size-3.5" />
          <span>SyncSpace Knowledge Base</span>
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#1F2937] tracking-tight">
          How can we help your team today?
        </h1>
        <p className="mt-2 text-base text-[#6B7280] max-w-xl mx-auto">
          Search articles, explore workflow guides, or submit a request directly to our support team.
        </p>

        <div className="relative mt-8 max-w-xl mx-auto">
          <Search className="absolute left-4 top-4 size-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides: 'websocket', 'kanban', 'invite'..."
            className="h-13 w-full rounded-2xl border border-[#E9E7F0] bg-white pl-12 pr-4 text-base outline-none shadow-md shadow-indigo-500/5 focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#6C4CF1]/10 transition"
          />
        </div>
      </div>

      {/* 2. Knowledge Base Article Cards */}
      <section aria-label="Help articles">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] tracking-tight mb-5">
          Featured Guides & Tutorials
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => {
            const Icon = article.icon
            return (
              <div
                key={article.title}
                className="group rounded-2xl border border-[#E9E7F0] bg-white p-6 shadow-xs hover:border-[#6C4CF1]/40 hover:-translate-y-1 hover:shadow-md transition cursor-pointer"
                onClick={() => toast(`Viewing guide: ${article.title}`)}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-[#F7F5FF] text-[#6C4CF1] group-hover:bg-[#6C4CF1] group-hover:text-white transition">
                  <Icon className="size-5.5" />
                </span>
                <span className="mt-4 inline-block text-xs font-bold text-[#6C4CF1] uppercase tracking-wider">
                  {article.category}
                </span>
                <h3 className="mt-1 text-base sm:text-lg font-bold text-[#1F2937] group-hover:text-[#6C4CF1] transition">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                  {article.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. Frequently Asked Questions (FAQ) */}
      <section aria-label="Frequently asked questions" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-8 shadow-xs">
        <h2 className="text-xl font-extrabold text-[#1F2937] tracking-tight mb-6">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-gray-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={faq.q} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left font-bold text-sm sm:text-base text-[#1F2937] hover:text-[#6C4CF1] transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`size-4.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-[#6C4CF1]' : ''}`} />
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-[#6B7280] leading-relaxed animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Contact Support Form */}
      <section aria-label="Contact support" className="rounded-2xl border border-[#E9E7F0] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
          <div className="grid size-10 place-items-center rounded-xl bg-purple-50 text-[#6C4CF1]">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937]">Contact Engineering Support</h2>
            <p className="text-xs text-[#6B7280]">Our distributed systems team is available 24/7 for critical issues.</p>
          </div>
        </div>

        <form onSubmit={handleContactSupport} className="space-y-4 max-w-xl">
          <div>
            <label htmlFor="support-subject" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
            <input
              id="support-subject"
              required
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              placeholder="e.g. WebSocket reconnection latency question"
              className="h-11 w-full rounded-xl border border-[#E9E7F0] px-3.5 text-sm outline-none focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
            />
          </div>

          <div>
            <label htmlFor="support-msg" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Message / Issue Details</label>
            <textarea
              id="support-msg"
              required
              rows={4}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Describe your question or error details..."
              className="w-full resize-none rounded-xl border border-[#E9E7F0] p-3 text-sm outline-none focus:border-[#6C4CF1] focus:ring-3 focus:ring-[#6C4CF1]/15"
            />
          </div>

          <Button type="submit" className="h-11 rounded-xl bg-[#6C4CF1] px-6 text-sm font-bold text-white hover:bg-[#5738D6]">
            Submit Request
          </Button>
        </form>
      </section>
    </div>
  )
}
