export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  let requestInput = input
  const token = typeof window === 'undefined' ? null : localStorage.getItem('syncspace_token')

  if (token) headers.set('Authorization', `Bearer ${token}`)

  if (
    typeof window !== 'undefined' &&
    typeof input === 'string' &&
    input.startsWith('/api/dashboard/summary')
  ) {
    const activeWorkspace = localStorage.getItem('syncspace_workspace')
    if (activeWorkspace) {
      try {
        const workspace = JSON.parse(activeWorkspace) as { id?: string; slug?: string }
        const workspaceKey = workspace.id ?? workspace.slug
        const url = new URL(input, window.location.origin)
        if (!url.searchParams.has('workspace') && workspaceKey) {
          url.searchParams.set('workspace', workspaceKey)
          requestInput = url.toString()
        }
      } catch (error) {
        console.error('Unable to read active workspace context:', error)
      }
    }
  }

  return fetch(requestInput, { ...init, headers })
}
