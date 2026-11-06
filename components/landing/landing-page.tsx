import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, CircleCheck, FileText, FolderKanban, LockKeyhole, Menu, MessageSquareText, Sparkles, Users2 } from 'lucide-react'
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
      <div className="absolute -inset-4 rounded-[2rem] border border-border bg-white" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_70px_-36px_rgba(17,24,39,0.28)]">
        <div className="flex h-12 items-center gap-2 border-b border-border px-4">
          <span className="size-2 rounded-full bg-border" /><span className="size-2 rounded-full bg-border" /><span className="size-2 rounded-full bg-border" />
          <div className="mx-auto flex h-6 w-40 items-center justify-center rounded-md bg-surface-muted text-[10px] text-muted-foreground">SAMPLE WORKSPACE</div>
        </div>
        <div className="grid min-h-[320px] min-w-0 grid-cols-1 sm:grid-cols-[142px_minmax(0,1fr)]">
          <aside className="hidden border-r border-border p-3 sm:block">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-semibold"><span className="grid size-5 place-items-center rounded-md bg-primary text-[9px] text-white">S</span> Northstar</div>
            <div className="space-y-1 text-[10px] text-muted-foreground">
              <div className="rounded-md bg-accent px-2 py-1.5 font-medium text-primary">Overview</div>
              <div className="px-2 py-1.5">Documents</div><div className="px-2 py-1.5">Projects</div><div className="px-2 py-1.5">Tasks</div>
            </div>
            <div className="mt-8 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Favorites</div>
            <div className="mt-2 space-y-2 text-[10px] text-muted-foreground"><div>◦ Product roadmap</div><div>◦ Launch plan</div></div>
          </aside>
          <div className="min-w-0 p-5 sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Sample workspace</p><h3 className="mt-1 text-base font-semibold tracking-tight">Good morning, Rohit</h3></div><UserAvatar initials="RK" name="Rohit Kumar" size="sm" /></div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[['12', 'Tasks'], ['4', 'Projects'], ['8', 'People']].map(([value, label]) => <div key={label} className="rounded-lg border border-border p-2.5"><div className="text-sm font-semibold">{value}</div><div className="mt-0.5 text-[9px] text-muted-foreground">{label}</div></div>)}
            </div>
            <div className="mt-5 flex items-center justify-between"><p className="text-[11px] font-semibold">Recent documents</p><span className="text-[9px] font-medium text-primary">View all</span></div>
            <div className="mt-2 space-y-2">
              {[
                ['Product roadmap — Q4 2026', 'Edited by Maya · 24m ago', 'MC'],
                ['Launch campaign brief', 'Edited by you · 2h ago', 'RK'],
              ].map(([title, details, initials]) => <div key={title} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5"><span className="grid size-7 place-items-center rounded-md bg-accent text-primary"><FileText className="size-3.5" /></span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">{title}</p><p className="mt-0.5 text-[9px] text-muted-foreground">{details}</p></div><span className="grid size-6 place-items-center rounded-full bg-secondary text-[8px] font-semibold text-muted-foreground">{initials}</span></div>)}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-muted p-2.5 text-[9px] text-muted-foreground"><span className="size-1.5 rounded-full bg-success" /> 3 teammates are online and collaborating</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  return (
    <main className="overflow-hidden bg-background">
      <header className="sticky top-0 z-20 mx-auto flex h-[76px] max-w-[1800px] items-center justify-between border-b border-border bg-white/90 px-5 backdrop-blur sm:px-8">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#how-it-works" className="transition hover:text-foreground">Solutions</a>
          <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
          <span aria-disabled="true" title="Documentation is coming soon" className="cursor-not-allowed text-muted-foreground/60">Documentation</span>
        </nav>
        <div className="flex items-center gap-2.5">
          <details className="relative md:hidden">
            <summary aria-label="Open navigation menu" className="grid size-9 list-none cursor-pointer place-items-center rounded-lg text-muted-foreground transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary">
              <Menu aria-hidden="true" className="size-4" />
            </summary>
            <nav aria-label="Mobile navigation" className="absolute top-full right-0 z-30 mt-2 flex w-52 flex-col rounded-2xl border border-border bg-white p-2 shadow-xl">
              <a href="#features" className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-surface-muted">Features</a>
              <a href="#how-it-works" className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-surface-muted">Solutions</a>
              <a href="#pricing" className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-surface-muted">Pricing</a>
              <span aria-disabled="true" title="Documentation is coming soon" className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground/60">Documentation · coming soon</span>
            </nav>
          </details>
          <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted sm:inline-flex">Sign in</Link>
          <Link href="/signup" className={buttonVariants({ className: 'h-10 rounded-lg px-4' })}>Get started <ArrowRight data-icon="inline-end" /></Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:pb-28 lg:pt-20">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"><Sparkles className="size-3.5 text-primary" /> A calmer way to do great work</div>
          <h1 className="text-[clamp(2.8rem,6vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.065em] text-foreground">Work Together.<br /><span className="text-primary">Build Together.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">One workspace for your team&apos;s documents, tasks, and collaboration. Bring the moving pieces together and make room for the work that matters.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className={buttonVariants({ className: 'h-11 rounded-lg bg-primary px-5 text-white hover:bg-primary-hover' })}>Get started for free <ArrowRight data-icon="inline-end" /></Link>
            <Link href="/login" className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-medium text-foreground transition hover:bg-surface-muted">Sign in</Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-success" /> Set up in minutes</span><span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-success" /> Built for teams</span></div>
        </div>
        <ProductPreview />
      </section>

      <section id="features" className="border-y border-border bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.17em] text-primary">Everything in sync</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-4xl">Less switching. More moving forward.</h2><p className="mt-4 leading-7 text-muted-foreground">Your team&apos;s work has a lot of moving parts. SyncSpace gives all of them a shared place to land.</p></div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-xl border border-border bg-white p-6 transition hover:border-primary/30 hover:shadow-sm"><span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><Icon aria-hidden="true" className="size-[18px]" /></span><h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></article>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.75fr_1.25fr]">
        <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-primary">How it works</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-4xl">A shared space that feels simple.</h2><p className="mt-4 max-w-md leading-7 text-muted-foreground">Get everyone on the same page without adding another complicated process.</p><Link href="/signup" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover">Create your workspace <ArrowUpRight aria-hidden="true" className="size-4" /></Link></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['01', 'Bring your team in', 'Create a workspace and invite the people you work with.'],
            ['02', 'Shape your space', 'Organize projects, documents, and work around your team.'],
            ['03', 'Make progress together', 'Share updates, see what is moving, and keep momentum.'],
          ].map(([number, title, description]) => <div key={number} className="rounded-xl border border-border p-5"><span className="text-xs font-semibold tracking-wider text-primary">{number}</span><h3 className="mt-8 text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>)}
        </div>
      </section>

      <section id="pricing" className="px-5 pb-12 pt-6 sm:px-8 sm:pb-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:p-10">
          <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-primary">Pricing</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Plans and billing are not configured here yet.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Create an account to explore SyncSpace&apos;s workspace and collaboration features. No plan or price is presented until billing is available.</p></div>
          <Link href="/signup" className={buttonVariants({ className: 'h-11 shrink-0 rounded-lg px-5' })}>Create account <ArrowRight data-icon="inline-end" /></Link>
        </div>
      </section>

      <section id="about" className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-white p-8 sm:flex-row sm:items-center sm:p-10">
          <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-primary">Ready when you are</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Good work starts with a shared space.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Create a workspace for the next thing you&apos;re building.</p></div>
          <Link href="/signup" className={buttonVariants({ className: 'h-11 shrink-0 rounded-lg bg-primary px-5 text-white hover:bg-primary-hover' })}>Get started <ArrowRight data-icon="inline-end" /></Link>
        </div>
      </section>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
            <div className="col-span-2 md:col-span-1">
              <Brand />
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">A shared space for teams to bring documents, people, and work together.</p>
            </div>
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">Product</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                <li><a href="#features" className="transition hover:text-foreground">Features</a></li>
                <li><a href="#features" className="transition hover:text-foreground">Collaborative editor</a></li>
                <li><a href="#how-it-works" className="transition hover:text-foreground">Workspace management</a></li>
                <li><a href="#features" className="transition hover:text-foreground">Project management</a></li>
                <li><a href="#features" className="transition hover:text-foreground">Security</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">Resources</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                <li><span aria-disabled="true" title="Coming soon" className="text-muted-foreground/60">Documentation</span></li>
                <li><span aria-disabled="true" title="Coming soon" className="text-muted-foreground/60">API reference</span></li>
                <li><span aria-disabled="true" title="Coming soon" className="text-muted-foreground/60">Help center</span></li>
                <li><span aria-disabled="true" title="Coming soon" className="text-muted-foreground/60">Changelog</span></li>
              </ul>
            </div>
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">Company</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                <li><a href="#about" className="transition hover:text-foreground">About</a></li>
                <li><span aria-disabled="true" title="Coming soon" className="text-muted-foreground/60">Contact</span></li>
                <li><span aria-disabled="true" title="Coming soon" className="text-muted-foreground/60">Careers</span></li>
              </ul>
            </div>
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">Legal</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                <li><span aria-disabled="true" title="Policy not published" className="text-muted-foreground/60">Privacy policy</span></li>
                <li><span aria-disabled="true" title="Policy not published" className="text-muted-foreground/60">Terms of service</span></li>
                <li><span aria-disabled="true" title="Policy not published" className="text-muted-foreground/60">Cookie policy</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} SyncSpace. Designed for thoughtful teamwork.</span>
            <div className="flex gap-5"><Link href="/login" className="transition hover:text-foreground">Sign in</Link><Link href="/signup" className="transition hover:text-foreground">Get started</Link></div>
          </div>
        </div>
      </footer>
    </main>
  )
}
