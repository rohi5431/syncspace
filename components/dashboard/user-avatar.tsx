export type AvatarTone = 'indigo' | 'emerald' | 'amber' | 'slate' | 'pink'

const toneClasses: Record<AvatarTone, string> = {
  indigo: 'bg-indigo-100 text-indigo-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-800',
  slate: 'bg-slate-100 text-slate-700',
  pink: 'bg-pink-100 text-pink-700',
}

export function UserAvatar({
  initials,
  name,
  tone = 'indigo',
  size = 'md',
  status = false,
}: {
  initials: string
  name: string
  tone?: AvatarTone
  size?: 'sm' | 'md' | 'lg'
  status?: boolean
}) {
  const sizeClasses = { sm: 'size-7 text-[10px]', md: 'size-9 text-xs', lg: 'size-11 text-sm' }

  return (
    <span className="relative inline-flex shrink-0" title={name}>
      <span aria-hidden="true" className={`grid place-items-center rounded-full font-semibold ${toneClasses[tone]} ${sizeClasses[size]}`}>
        {initials}
      </span>
      {status && <span aria-label="Online" className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-green-500" />}
    </span>
  )
}
