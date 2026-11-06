'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

const ToastContext = createContext<(message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((nextMessage: string) => {
    setMessage(nextMessage)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 3200)
  }, [])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex justify-center sm:inset-x-auto sm:right-5 sm:justify-end" aria-live="polite" aria-atomic="true">
        {message && (
          <div role="status" className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-lg">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-green-600" />
            <p className="flex-1 leading-5">{message}</p>
            <button type="button" onClick={() => setMessage(null)} className="rounded p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Dismiss notification">
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
