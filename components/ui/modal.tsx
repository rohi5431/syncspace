'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'sm',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md'
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const panel = panelRef.current
    const firstFocusable = panel?.querySelector<HTMLElement>('input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])')
    firstFocusable?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key === 'Tab' && panel) {
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby={description ? 'modal-description' : undefined} className={`w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-xl ${size === 'md' ? 'max-w-lg' : 'max-w-md'}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-gray-950">{title}</h2>
            {description && <p id="modal-description" className="mt-1.5 text-sm leading-6 text-gray-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="-mr-2 -mt-2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Close dialog">
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
