const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const fullDate = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })

export function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return 'Unknown date'
  const seconds = Math.round((timestamp - Date.now()) / 1000)
  const absoluteSeconds = Math.abs(seconds)
  if (absoluteSeconds < 60) return relativeTime.format(seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return relativeTime.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relativeTime.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return relativeTime.format(days, 'day')
  return fullDate.format(timestamp)
}

export function formatFullDate(value: string) {
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? fullDate.format(timestamp) : 'Unknown date'
}
