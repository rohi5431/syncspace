import Link from 'next/link'
import { Layers3 } from 'lucide-react'

export function Brand({ href = '/', compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 rounded-md text-foreground" aria-label="SyncSpace home">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Layers3 aria-hidden="true" className="size-[18px]" />
      </span>
      {!compact && <span className="text-[17px] font-semibold tracking-[-0.04em]">SyncSpace</span>}
    </Link>
  )
}
