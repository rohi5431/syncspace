'use client'

import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Database,
  FileText,
  GitBranch,
  HardDrive,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  Network,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
  Zap,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Security center', icon: ShieldCheck, active: true },
  { label: 'Workspaces', icon: Users },
  { label: 'Documents', icon: FileText },
  { label: 'Activity logs', icon: Activity },
]

const systems = [
  { name: 'API gateway', detail: '5 instances · 99.99% uptime', icon: Network, color: 'purple', metric: '142 req/s' },
  { name: 'PostgreSQL', detail: 'Primary · us-east-1', icon: Database, color: 'green', metric: '18 ms' },
  { name: 'Redis Pub/Sub', detail: '3 nodes · healthy', icon: Zap, color: 'orange', metric: '2.4k msg/s' },
  { name: 'BullMQ workers', detail: '8 active · 0 failed', icon: Server, color: 'blue', metric: '98.7%' },
]

const events = [
  { title: 'New sign-in from Chrome on macOS', detail: 'San Francisco, US · 2 minutes ago', icon: LockKeyhole, tone: 'green' },
  { title: 'Workspace role changed', detail: 'Maya Patel promoted to Admin · 34 minutes ago', icon: Users, tone: 'purple' },
  { title: 'Document access granted', detail: 'Q4 Product Roadmap · 1 hour ago', icon: FileText, tone: 'orange' },
  { title: 'Session revoked', detail: 'Firefox on Windows · Yesterday at 4:18 PM', icon: LogOut, tone: 'red' },
]

export function SyncSpaceDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Security overview')
  const [notice, setNotice] = useState<string | null>(null)

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 3200)
  }

  return (
    <div className="min-h-screen bg-[#f6f5fc] text-[#211d38]">
      {notice && (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-xl bg-[#201c38] px-4 py-3 text-sm font-medium text-white shadow-xl">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#8c7cf0]"><Check className="size-3.5" /></span>
          {notice}
          <button onClick={() => setNotice(null)} aria-label="Dismiss notification"><X className="size-4 text-white/60" /></button>
        </div>
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[250px] bg-[#252044] px-4 py-5 text-white transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-3 pb-9">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#8e7bf0] shadow-[0_5px_18px_rgba(142,123,240,.35)]"><GitBranch className="size-5" /></div>
          <span className="text-[18px] font-semibold tracking-[-.02em]">SyncSpace</span>
        </div>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/35">Workspace</p>
        <button onClick={() => showNotice('Workspace switcher opened')} className="mb-7 flex w-full items-center justify-between rounded-xl bg-white/[.08] px-3 py-2.5 text-left text-sm font-medium hover:bg-white/[.12]">
          <span className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-lg bg-[#c8c0ff] text-[11px] font-bold text-[#38305e]">A</span> Acme Inc.</span><ChevronDown className="size-4 text-white/50" />
        </button>
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon, active }) => <button key={label} onClick={() => showNotice(`${label} selected`)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${active ? 'bg-[#8c7cf0] text-white shadow-[0_5px_16px_rgba(140,124,240,.22)]' : 'text-white/55 hover:bg-white/[.07] hover:text-white'}`}><Icon className="size-[17px]" />{label}</button>)}
        </nav>
        <p className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/35">Manage</p>
        <nav className="space-y-1">
          <button onClick={() => showNotice('Settings selected')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/55 hover:bg-white/[.07] hover:text-white"><Settings className="size-[17px]" />Settings</button>
          <button onClick={() => showNotice('Help center opened')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/55 hover:bg-white/[.07] hover:text-white"><CircleHelp className="size-[17px]" />Help center</button>
        </nav>
        <div className="absolute bottom-5 left-4 right-4 border-t border-white/10 pt-4"><div className="flex items-center gap-3 px-2"><div className="flex size-8 items-center justify-center rounded-full bg-[#f5c2b5] text-xs font-bold text-[#583735]">JD</div><div className="min-w-0"><p className="truncate text-xs font-semibold">Jordan Davis</p><p className="truncate text-[11px] text-white/40">Owner</p></div><MoreHorizontal className="ml-auto size-4 text-white/40" /></div></div>
      </aside>
      {sidebarOpen && <button aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/30 lg:hidden" />}
      <main className="lg:pl-[250px]">
        <header className="flex h-[72px] items-center justify-between border-b border-[#e8e5f2] bg-white/75 px-5 backdrop-blur md:px-9">
          <div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu className="size-5" /></button><div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a7a2b9]" /><input aria-label="Search" placeholder="Search anything..." className="h-9 w-[225px] rounded-lg border-0 bg-[#f6f5fc] pl-9 text-xs outline-none placeholder:text-[#aaa5b9] focus:ring-2 focus:ring-[#cfc8ff]" /></div></div>
          <div className="flex items-center gap-4"><button onClick={() => showNotice('No new notifications')} className="relative text-[#8d879f] hover:text-[#554d79]"><Bell className="size-[18px]" /><span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[#ee8c79]" /></button><div className="h-6 w-px bg-[#e8e5f2]" /><button onClick={() => showNotice('Profile menu opened')} className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-full bg-[#f5c2b5] text-[11px] font-bold text-[#583735]">JD</span><span className="hidden text-xs font-semibold text-[#3e385b] md:block">Jordan Davis</span><ChevronDown className="size-3.5 text-[#a7a2b9]" /></button></div>
        </header>
        <div className="mx-auto max-w-[1360px] px-5 py-7 md:px-9 md:py-9">
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-[#9a95ac]"><span>Acme Inc.</span><span>/</span><span className="text-[#6d668d]">Security center</span></div><h1 className="text-[29px] font-semibold tracking-[-.04em] text-[#282340]">Security center</h1><p className="mt-1.5 text-[13px] text-[#8c879c]">Monitor your workspace security and account activity.</p></div><div className="flex items-center gap-2"><button onClick={() => showNotice('Security report downloaded')} className="flex items-center gap-2 rounded-lg border border-[#e0ddec] bg-white px-3.5 py-2 text-xs font-semibold text-[#655d80] shadow-sm hover:bg-[#faf9ff]"><ArrowDownToLine className="size-3.5" /> Export report</button><button onClick={() => showNotice('Security scan completed')} className="flex items-center gap-2 rounded-lg bg-[#8979e9] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_5px_14px_rgba(137,121,233,.25)] hover:bg-[#7768dc]"><RefreshCw className="size-3.5" /> Run security scan</button></div></div>
          <div className="mb-7 flex items-center gap-6 border-b border-[#e5e1ef] text-[12px] font-semibold"><button onClick={() => setActiveTab('Security overview')} className={`border-b-2 pb-3 ${activeTab === 'Security overview' ? 'border-[#8979e9] text-[#6557c8]' : 'border-transparent text-[#aaa5b7]'}`}>Security overview</button><button onClick={() => setActiveTab('Sessions')} className={`border-b-2 pb-3 ${activeTab === 'Sessions' ? 'border-[#8979e9] text-[#6557c8]' : 'border-transparent text-[#aaa5b7]'}`}>Sessions <span className="ml-1 rounded-full bg-[#f0edff] px-1.5 py-0.5 text-[10px] text-[#7869d3]">3</span></button><button onClick={() => setActiveTab('Audit log')} className={`border-b-2 pb-3 ${activeTab === 'Audit log' ? 'border-[#8979e9] text-[#6557c8]' : 'border-transparent text-[#aaa5b7]'}`}>Audit log</button></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard icon={ShieldCheck} label="Security score" value="94" suffix="/100" trend="+6 this month" color="purple" /><MetricCard icon={Users} label="Active sessions" value="12" trend="3 yours" color="blue" /><MetricCard icon={AlertTriangle} label="Open alerts" value="2" trend="Needs attention" color="orange" alert /><MetricCard icon={Activity} label="Audit events" value="1,284" trend="Last 30 days" color="green" /></div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
            <section className="rounded-2xl border border-[#e6e2f0] bg-white p-5 shadow-[0_3px_15px_rgba(48,38,91,.03)]"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-[14px] font-semibold text-[#332d50]">Security posture</h2><p className="mt-1 text-[11px] text-[#a09bad]">Your workspace is protected</p></div><span className="flex items-center gap-1.5 rounded-full bg-[#e9f8ef] px-2.5 py-1 text-[10px] font-bold text-[#33945b]"><span className="size-1.5 rounded-full bg-[#4fc477]" /> Healthy</span></div><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="relative flex size-[142px] shrink-0 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#8979e9 0deg 338deg, #eeebf8 338deg 360deg)' }}><div className="flex size-[116px] flex-col items-center justify-center rounded-full bg-white"><span className="text-[30px] font-semibold tracking-[-.06em] text-[#312b50]">94</span><span className="text-[10px] font-medium text-[#aaa5b6]">out of 100</span></div></div><div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4">{[['Identity & access','100%','green'],['Data protection','92%','purple'],['Network security','96%','blue'],['Compliance','88%','orange']].map(([label, value, tone]) => <div key={label}><div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-[#6d6686]"><span>{label}</span><span className="font-semibold text-[#423b62]">{value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#f0eef7]"><div className={`h-full rounded-full ${tone === 'green' ? 'bg-[#65c98b]' : tone === 'purple' ? 'bg-[#8979e9]' : tone === 'blue' ? 'bg-[#6ea9dc]' : 'bg-[#f0af69]'}`} style={{ width: value }} /></div></div>)}</div></div><button onClick={() => showNotice('Opening recommendations')} className="mt-6 flex w-full items-center justify-between rounded-xl bg-[#faf9ff] px-3.5 py-3 text-[11px] font-semibold text-[#6d61bd] hover:bg-[#f4f1ff]"><span className="flex items-center gap-2"><SlidersHorizontal className="size-3.5" /> View recommendations</span><ArrowUpRight className="size-3.5" /></button></section>
            <section className="rounded-2xl border border-[#e6e2f0] bg-white p-5 shadow-[0_3px_15px_rgba(48,38,91,.03)]"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-[14px] font-semibold text-[#332d50]">System health</h2><p className="mt-1 text-[11px] text-[#a09bad]">Live infrastructure status</p></div><button onClick={() => showNotice('System status refreshed')} aria-label="Refresh system health"><RefreshCw className="size-4 text-[#aaa4ba]" /></button></div><div className="space-y-3">{systems.map(({ name, detail, icon: Icon, color, metric }) => <div key={name} className="flex items-center gap-3"><div className={`flex size-8 items-center justify-center rounded-lg ${color === 'purple' ? 'bg-[#f0edff] text-[#8979e9]' : color === 'green' ? 'bg-[#eaf8ef] text-[#4ab979]' : color === 'orange' ? 'bg-[#fff3e7] text-[#e99b51]' : 'bg-[#eaf3fc] text-[#6b9ed0]'}`}><Icon className="size-4" /></div><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-[#4b4565]">{name}</p><p className="truncate text-[10px] text-[#aaa5b5]">{detail}</p></div><div className="text-right"><p className="text-[11px] font-semibold text-[#4b4565]">{metric}</p><p className="flex items-center justify-end gap-1 text-[9px] font-semibold text-[#48ae70]"><span className="size-1.5 rounded-full bg-[#5dca83]" /> Operational</p></div></div>)}</div></section>
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
            <section className="rounded-2xl border border-[#e6e2f0] bg-white p-5 shadow-[0_3px_15px_rgba(48,38,91,.03)]"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-[14px] font-semibold text-[#332d50]">Recent security activity</h2><p className="mt-1 text-[11px] text-[#a09bad]">Events across your workspace</p></div><button onClick={() => setActiveTab('Audit log')} className="text-[11px] font-semibold text-[#7769d1] hover:text-[#5e50b6]">View all activity <span className="ml-1">→</span></button></div><div className="divide-y divide-[#f1eff6]">{events.map(({ title, detail, icon: Icon, tone }) => <div key={title} className="flex items-center gap-3.5 py-3"><div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tone === 'green' ? 'bg-[#eaf8ef] text-[#51b879]' : tone === 'purple' ? 'bg-[#f0edff] text-[#8676df]' : tone === 'orange' ? 'bg-[#fff3e7] text-[#e59a55]' : 'bg-[#fff0ee] text-[#e78473]'}`}><Icon className="size-3.5" /></div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-[#514b68]">{title}</p><p className="mt-0.5 truncate text-[10px] text-[#aaa5b5]">{detail}</p></div><button onClick={() => showNotice('Event details opened')} aria-label={`View details for ${title}`}><ArrowUpRight className="size-3.5 text-[#b3aec0]" /></button></div>)}</div></section>
            <section className="rounded-2xl border border-[#e6e2f0] bg-white p-5 shadow-[0_3px_15px_rgba(48,38,91,.03)]"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-[14px] font-semibold text-[#332d50]">Security checklist</h2><p className="mt-1 text-[11px] text-[#a09bad]">2 items need your attention</p></div><span className="text-[11px] font-semibold text-[#8c83ac]">4 / 6 complete</span></div><div className="mb-5 h-1.5 overflow-hidden rounded-full bg-[#f0eef7]"><div className="h-full w-2/3 rounded-full bg-[#8979e9]" /></div><div className="space-y-3">{[['Enable two-factor authentication', 'Recommended for owners', false],['Review inactive sessions', '3 sessions haven’t been used in 30 days', false],['Recovery email verified', 'Completed 2 months ago', true]].map(([title, detail, done]) => <div key={title as string} className="flex items-start gap-3"><div className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${done ? 'border-[#63c887] bg-[#63c887] text-white' : 'border-[#d9d4e6]'}`}>{done && <Check className="size-2.5" />}</div><div><p className={`text-[11px] font-semibold ${done ? 'text-[#8c879b] line-through' : 'text-[#514b68]'}`}>{title as string}</p><p className="mt-0.5 text-[10px] text-[#aaa5b5]">{detail as string}</p></div>{!done && <button onClick={() => showNotice(`${title} opened`)} className="ml-auto text-[10px] font-semibold text-[#7769d1]">Review</button>}</div>)}</div></section>
          </div>
          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-[#e5e1ee] pt-5 text-[10px] text-[#aaa5b7] sm:flex-row"><span>SyncSpace Enterprise · All systems operational</span><span className="flex items-center gap-3"><span>Last scan 4 minutes ago</span><span className="flex items-center gap-1 text-[#6dba88]"><Clock3 className="size-3" /> Updated live</span></span></footer>
        </div>
      </main>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, suffix, trend, color, alert = false }: { icon: typeof ShieldCheck; label: string; value: string; suffix?: string; trend: string; color: string; alert?: boolean }) {
  return <div className="rounded-2xl border border-[#e6e2f0] bg-white p-4 shadow-[0_3px_15px_rgba(48,38,91,.03)]"><div className="flex items-start justify-between"><div className={`flex size-8 items-center justify-center rounded-lg ${color === 'purple' ? 'bg-[#f0edff] text-[#8979e9]' : color === 'blue' ? 'bg-[#eaf3fc] text-[#679bd0]' : color === 'orange' ? 'bg-[#fff3e7] text-[#e99b51]' : 'bg-[#eaf8ef] text-[#51b879]'}`}><Icon className="size-4" /></div>{alert ? <span className="rounded-full bg-[#fff1e7] px-2 py-1 text-[9px] font-bold text-[#e39a53]">Review</span> : <ArrowUpRight className="size-4 text-[#b6b0c5]" />}</div><div className="mt-4 flex items-baseline gap-1"><span className="text-[25px] font-semibold tracking-[-.05em] text-[#332d50]">{value}</span>{suffix && <span className="text-[11px] font-medium text-[#aaa5b5]">{suffix}</span>}</div><div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#9e99aa]"><span className={`size-1.5 rounded-full ${alert ? 'bg-[#efa463]' : 'bg-[#62c785]'}`} />{trend}</div></div>
}
