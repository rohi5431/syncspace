'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import useSWR from 'swr'
import type { WorkspaceSummary } from '@syncspace/contracts'
import { ApiError, apiFetcher, WORKSPACES_KEY } from '@/lib/api-client'

interface WorkspaceContextValue {
  workspaces: WorkspaceSummary[]
  activeWorkspace: WorkspaceSummary | null
  selectedWorkspaceId: string | null
  setSelectedWorkspaceId: (workspaceId: string) => void
  isLoading: boolean
  error: ApiError | undefined
  refresh: () => Promise<WorkspaceSummary[] | undefined>
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<WorkspaceSummary[], ApiError>(WORKSPACES_KEY, apiFetcher, {
    shouldRetryOnError: (requestError) => requestError.status >= 500,
  })
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const workspaces = data ?? []
  const activeWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? workspaces[0] ?? null
  const value = useMemo<WorkspaceContextValue>(() => ({
    workspaces,
    activeWorkspace,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    isLoading,
    error,
    refresh: () => mutate(),
  }), [activeWorkspace, error, isLoading, mutate, selectedWorkspaceId, workspaces])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspaceContext() {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('useWorkspaceContext must be used within a WorkspaceProvider.')
  return value
}
