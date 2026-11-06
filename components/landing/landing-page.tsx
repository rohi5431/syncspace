import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, CircleCheck, FileText, FolderKanban, LockKeyhole, MessageSquareText, Sparkles, Users2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Brand } from '@/components/brand/brand'
import { UserAvatar } from '@/components/dashboard/user-avatar'

const features = [
  { icon: MessageSquareText, title: 'Work in the same moment', description: 'Keep ideas moving with comments and conversations right beside the work they belong to.' },
  { icon: FolderKanban, title: 'One home for every team', description: 'Give each project a clear home, while keeping the whole workspace easy to navigate.' },
  { icon: FileText, title: 'Documents that stay connected', description: 'Bring meeting notes, briefs, and plans together with the projects that use them.' },
  { icon: CircleCheck, title: 'Make progress visible', description: 'Turn plans into tasks, set ownership, and understand what needs attention next.' },
  { icon: Users2, title: 'Invite the right people', description: 'Keep access simple with clear roles and a shared view of who is involved.' },
  { icon: LockKeyhole, title: 'Private by design', description: 'A considered, secure workspace keeps your team’s work in one trusted place.' },
]

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute -inset-4 rounded-[2rem] border border-gray-100 bg-white" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_70px_-36px_rgba(17,24,39,0.28)]">
        <div className="flex h-12 items-center gap-2 border-b border-gray-100 px-4">
          <span className="size-2 rounded-full bg-gray-300" /><span className="size-2 rounded-full bg-gray-300" /><span className="size-2 rounded-full bg-gray-300" />
          <div className="mx-auto flex h-6 w-40 items-center justify-center rounded-md bg-gray-50 text-[10px] text-gray-400">workspace.syncspace.app</div>
        </div>
        <div className="grid min-h-[320px] grid-cols-[142px_1fr]">
          <aside className="border-r border-gray-100 p-3">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-semibold"><span className="grid size-5 place-items-center rounded-md bg-indigo-600 text-[9px] text-white">S</span> Northstar</div>
            <div className="space-y-1 text-[10px] text-gray-500">
              <div className="rounded-md bg-indigo-50 px-2 py-1.5 font-medium text-indigo-700">Overview</div>
              <div className="px-2 py-1.5">Documents</div><div className="px-2 py-1.5">Projects</div><div className="px-2 py-1.5">Tasks</div>
            </div>
            <div className="mt-8 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400">Favorites</div>
            <div className="mt-2 space-y-2 text-[10px] text-gray-500"><div>◦ Product roadmap</div><div>◦ Launch plan</div></div>
          </aside>
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-[9px] font-medium uppercase tracking-[0.16em] text-gray-400">Friday, November 6</p><h3 className="mt-1 text-base font-semibold tracking-tight">Good morning, Rohit</h3></div><UserAvatar initials="RK" name="Rohit Kumar" size="sm" /></div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[['12', 'Tasks'], ['4', 'Projects'], ['8', 'People']].map(([value, label]) => <div key={label} className="rounded-lg border border-gray-100 p-2.5"><div className="text-sm font-semibold">{value}</div><div className="mt-0.5 text-[9px] text-gray-400">{label}</div></div>)}
            </div>
            <div className="mt-5 flex items-center justify-between"><p className="text-[11px] font-semibold">Recent documents</p><span className="text-[9px] font-medium text-indigo-600">View all</span></div>
            <div className="mt-2 space-y-2">
              {[
                ['Product roadmap — Q4 2026', 'Edited by Maya · 24m ago', 'MC'],
                ['Launch campaign brief', 'Edited by you · 2h ago', 'RK'],
              ].map(([title, details, initials]) => <div key={title} className="flex items-center gap-2.5 rounded-lg border border-gray-100 p-2.5"><span className="grid size-7 place-items-center rounded-md bg-indigo-50 text-indigo-600"><FileText className="size-3.5" /></span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">{title}</p><p className="mt-0.5 text-[9px] text-gray-400">{details}</p></div><span className="grid size-6 place-items-center rounded-full bg-gray-100 text-[8px] font-semibold text-gray-600">{initials}</span></div>)}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 p-2.5 text-[9px] text-gray-500"><span className="size-1.5 rounded-full bg-green-500" /> 3 teammates are online and collaborating</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  return (
    <main className="overflow-hidden bg-white">
      <header className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
          <a href="#features" className="transition hover:text-gray-950">Features</a>
          <a href="#how-it-works" className="transition hover:text-gray-950">How it works</a>
          <a href="#about" className="transition hover:text-gray-950">About</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:inline-flex">Sign in</Link>
          <Link href="/signup" className={buttonVariants({ className: 'h-10 rounded-lg bg-indigo-600 px-4 text-white hover:bg-indigo-700' })}>Get started <ArrowRight data-icon="inline-end" /></Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:pb-28 lg:pt-20">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600"><Sparkles className="size-3.5 text-indigo-600" /> A calmer way to do great work</div>
          <h1 className="text-[clamp(2.8rem,6vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.065em] text-gray-950">Work Together.<br /><span className="text-indigo-600">Build Together.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">One workspace for your team&apos;s documents, tasks, and collaboration. Bring the moving pieces together and make room for the work that matters.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className={buttonVariants({ className: 'h-11 rounded-lg bg-indigo-600 px-5 text-white hover:bg-indigo-700' })}>Get started for free <ArrowRight data-icon="inline-end" /></Link>
            <Link href="/login" className="inline-flex h-11 items-center rounded-lg border border-gray-200 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">Sign in</Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500"><span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-green-600" /> Set up in minutes</span><span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-green-600" /> Built for teams</span></div>
        </div>
        <ProductPreview />
      </section>

      <section id="features" className="border-y border-gray-100 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.17em] text-indigo-600">Everything in sync</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-gray-950 sm:text-4xl">Less switching. More moving forward.</h2><p className="mt-4 leading-7 text-gray-600">Your team&apos;s work has a lot of moving parts. SyncSpace gives all of them a shared place to land.</p></div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-indigo-200 hover:shadow-sm"><span className="grid size-10 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><Icon aria-hidden="true" className="size-[18px]" /></span><h3 className="mt-5 text-base font-semibold text-gray-950">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{description}</p></article>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.75fr_1.25fr]">
        <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-indigo-600">How it works</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-gray-950 sm:text-4xl">A shared space that feels simple.</h2><p className="mt-4 max-w-md leading-7 text-gray-600">Get everyone on the same page without adding another complicated process.</p><Link href="/signup" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">Create your workspace <ArrowUpRight aria-hidden="true" className="size-4" /></Link></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['01', 'Bring your team in', 'Create a workspace and invite the people you work with.'],
            ['02', 'Shape your space', 'Organize projects, documents, and work around your team.'],
            ['03', 'Make progress together', 'Share updates, see what is moving, and keep momentum.'],
          ].map(([number, title, description]) => <div key={number} className="rounded-xl border border-gray-200 p-5"><span className="text-xs font-semibold tracking-wider text-indigo-600">{number}</span><h3 className="mt-8 text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{description}</p></div>)}
        </div>
      </section>

      <section id="about" className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-8 sm:flex-row sm:items-center sm:p-10">
          <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-indigo-600">Ready when you are</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">Good work starts with a shared space.</h2><p className="mt-2 text-sm leading-6 text-gray-600">Create a workspace for the next thing you&apos;re building.</p></div>
          <Link href="/signup" className={buttonVariants({ className: 'h-11 shrink-0 rounded-lg bg-indigo-600 px-5 text-white hover:bg-indigo-700' })}>Get started <ArrowRight data-icon="inline-end" /></Link>
        </div>
      </section>

      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Brand /><span>© 2026 SyncSpace. Designed for thoughtful teamwork.</span><div className="flex gap-5"><Link href="/login" className="hover:text-gray-900">Sign in</Link><Link href="/signup" className="hover:text-gray-900">Get started</Link></div></div>
      </footer>
    </main>
  )
}
