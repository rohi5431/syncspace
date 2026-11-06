import Link from 'next/link'
import { Layers3 } from 'lucide-react'

export function Brand({
  href = '/',
  compact = false,
  size = 'md',
}: {
  href?: string
  compact?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const iconSizes = {
    sm: 'size-8 rounded-lg',
    md: 'size-10 rounded-xl',
    lg: 'size-12 rounded-xl shadow-md shadow-indigo-500/20',
  }
  const innerIconSizes = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  }
  const textSizes = {
    sm: 'text-[16px]',
    md: 'text-[18px]',
    lg: 'text-[23px]',
  }

  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3 rounded-lg outline-none transition-transform hover:scale-[1.01]"
      aria-label="SyncSpace home"
    >
      <span
        className={`grid place-items-center bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 text-white shadow-sm transition-all group-hover:shadow-indigo-500/30 ${iconSizes[size]}`}
      >
        <Layers3 aria-hidden="true" className={innerIconSizes[size]} />
      </span>
      {!compact && (
        <span className={`font-bold tracking-tight text-gray-950 ${textSizes[size]}`}>
          SyncSpace
        </span>
      )}
    </Link>
  )
}
