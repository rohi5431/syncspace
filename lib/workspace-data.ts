import { mutate } from 'swr'
import { WORKSPACES_KEY } from '@/lib/api-client'

export async function refreshWorkspaceData(workspaceId: string) {
  await mutate((key) => typeof key === 'string' && (
    key === WORKSPACES_KEY ||
    key.startsWith(`/api/workspaces/${workspaceId}`) ||
    key.startsWith('/api/documents/')
  ), undefined, { revalidate: true })
}
