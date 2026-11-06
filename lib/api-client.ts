import useSWR from 'swr'
import type { SafeUser } from '@syncspace/contracts'

export const AUTH_USER_KEY = '/api/auth/me'
export const WORKSPACES_KEY = '/api/workspaces'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const normalizedPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(options.headers)
  const body = options.body === undefined ? undefined : JSON.stringify(options.body)

  if (body !== undefined) headers.set('Content-Type', 'application/json')

  const response = await fetch(normalizedPath, {
    ...options,
    body,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    let message = 'The request could not be completed.'
    try {
      const payload = await response.json() as { message?: string | string[] }
      if (typeof payload.message === 'string') message = payload.message
      else if (Array.isArray(payload.message)) message = payload.message.join(' ')
    } catch {
      message = response.statusText || message
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function apiFetcher<T>(key: string): Promise<T> {
  return apiRequest<T>(key.replace(/^\/api/, ''))
}

export function useAuth() {
  const { data: user, error, isLoading, mutate } = useSWR<SafeUser, ApiError>(AUTH_USER_KEY, apiFetcher, {
    shouldRetryOnError: (requestError) => requestError.status >= 500,
  })

  return { user, error, isLoading, mutate }
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'
}
