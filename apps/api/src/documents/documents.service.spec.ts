import { jest } from '@jest/globals'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { DocumentsService } from './documents.service'

const document = {
  id: 'document-id',
  title: 'Architecture',
  description: null,
  content: { type: 'doc', content: [] },
  workspaceId: 'workspace-id',
  folderId: null,
  createdById: 'user-a',
  createdBy: { id: 'user-a', name: 'A User', email: 'a@example.com', avatarUrl: null },
  isArchived: false,
  createdAt: '2026-11-06T00:00:00.000Z',
  updatedAt: '2026-11-06T00:00:00.000Z',
  permissionRole: null,
}

const access = {
  document,
  workspaceRole: 'OWNER' as const,
  canRead: true,
  canEdit: true,
  canManageSharing: true,
  canDelete: true,
}

describe('DocumentsService', () => {
  const repository = {
    create: jest.fn(),
    list: jest.fn(),
    findAccess: jest.fn(),
    updateMetadata: jest.fn(),
    softDelete: jest.fn(),
    duplicate: jest.fn(),
    updateContent: jest.fn(),
    listPermissions: jest.fn(),
    findWorkspaceMemberByEmail: jest.fn(),
    upsertPermission: jest.fn(),
    updatePermission: jest.fn(),
    removePermission: jest.fn(),
    listVersions: jest.fn(),
    getVersion: jest.fn(),
  }
  const workspaces = { getMembership: jest.fn() }
  const folders = { assertInWorkspace: jest.fn() }
  let service: DocumentsService

  beforeEach(() => {
    jest.clearAllMocks()
    workspaces.getMembership.mockResolvedValue('MEMBER')
    folders.assertInWorkspace.mockResolvedValue({ id: 'folder-id' })
    repository.create.mockResolvedValue(document)
    repository.list.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10, pageCount: 0 })
    repository.findAccess.mockResolvedValue(access)
    repository.updateMetadata.mockResolvedValue(document)
    repository.softDelete.mockResolvedValue(true)
    repository.duplicate.mockResolvedValue({ ...document, id: 'copy-id' })
    repository.updateContent.mockResolvedValue(1)
    repository.listPermissions.mockResolvedValue([])
    repository.findWorkspaceMemberByEmail.mockResolvedValue({ id: 'user-b', name: 'B User' })
    repository.upsertPermission.mockResolvedValue({ permission: { id: 'permission-id', role: 'VIEWER' }, changed: true })
    repository.updatePermission.mockResolvedValue({ id: 'permission-id', role: 'EDITOR' })
    repository.removePermission.mockResolvedValue(true)
    repository.listVersions.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10, pageCount: 0 })
    repository.getVersion.mockResolvedValue({ id: 'version-id' })
    service = new DocumentsService(repository as never, workspaces as never, folders as never)
  })

  it('creates a real workspace document with the authenticated user as creator', async () => {
    await service.create('workspace-id', 'user-a', { title: ' Architecture ' })
    expect(workspaces.getMembership).toHaveBeenCalledWith('workspace-id', 'user-a')
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      userId: 'user-a',
      title: 'Architecture',
      description: null,
      folderId: null,
    })
  })

  it('validates a destination folder when creating a document', async () => {
    await service.create('workspace-id', 'user-a', { title: 'Notes', folderId: 'folder-id' })
    expect(folders.assertInWorkspace).toHaveBeenCalledWith('folder-id', 'workspace-id')
  })

  it('passes title search, folder filters, sorting, and pagination to the repository', async () => {
    const query = { page: 2, pageSize: 10, search: 'architecture', folderId: 'root', sortBy: 'createdAt', sortDirection: 'asc' } as const
    await service.list('workspace-id', 'user-a', query)
    expect(repository.list).toHaveBeenCalledWith('workspace-id', 'user-a', 'MEMBER', query)
  })

  it('updates metadata only after checking edit access', async () => {
    await service.updateMetadata('document-id', 'user-a', { title: 'Updated' })
    expect(repository.updateMetadata).toHaveBeenCalledWith('document-id', 'user-a', {
      title: 'Updated',
      description: undefined,
      folderId: undefined,
      isArchived: undefined,
    })
  })

  it('soft-deletes a document instead of removing its history', async () => {
    await service.remove('document-id', 'user-a')
    expect(repository.softDelete).toHaveBeenCalledWith('document-id', 'user-a')
  })

  it('blocks a VIEWER from editing document metadata', async () => {
    repository.findAccess.mockResolvedValue({ ...access, canEdit: false, canDelete: false, canManageSharing: false })
    await expect(service.updateMetadata('document-id', 'user-b', { title: 'Blocked' }))
      .rejects.toBeInstanceOf(ForbiddenException)
    expect(repository.updateMetadata).not.toHaveBeenCalled()
  })

  it('allows an EDITOR to update content and records the resulting version number', async () => {
    repository.findAccess.mockResolvedValue({
      ...access,
      document: { ...document, permissionRole: 'EDITOR' },
      canManageSharing: false,
    })
    repository.updateContent.mockResolvedValue(3)
    const result = await service.updateContent('document-id', 'user-b', {
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      changeSummary: 'Added the introduction',
    })
    expect(result.versionNumber).toBe(3)
    expect(repository.updateContent).toHaveBeenCalledWith(
      'document-id',
      'user-b',
      { type: 'doc', content: [{ type: 'paragraph' }] },
      'Added the introduction',
    )
  })

  it('prevents an EDITOR from managing sharing', async () => {
    repository.findAccess.mockResolvedValue({ ...access, canManageSharing: false })
    await expect(service.share('document-id', 'user-b', { email: 'member@example.com', role: 'VIEWER' }))
      .rejects.toBeInstanceOf(ForbiddenException)
  })

  it('shares only with a member of the same workspace', async () => {
    await service.share('document-id', 'user-a', { email: 'member@example.com', role: 'VIEWER' })
    expect(repository.findWorkspaceMemberByEmail).toHaveBeenCalledWith('workspace-id', 'member@example.com')
    expect(repository.upsertPermission).toHaveBeenCalledWith(expect.objectContaining({
      workspaceId: 'workspace-id',
      documentId: 'document-id',
      targetUserId: 'user-b',
      role: 'VIEWER',
    }))
  })

  it('hides documents from users without workspace or document access', async () => {
    repository.findAccess.mockResolvedValue(null)
    await expect(service.get('document-id', 'outsider')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('does not list workspace documents for a non-member', async () => {
    workspaces.getMembership.mockResolvedValue(null)
    await expect(service.list('workspace-id', 'outsider', { page: 1, pageSize: 10 } as never))
      .rejects.toBeInstanceOf(NotFoundException)
    expect(repository.list).not.toHaveBeenCalled()
  })

  it('checks read access before returning version history', async () => {
    await service.listVersions('document-id', 'user-a', { page: 1, pageSize: 10 })
    expect(repository.listVersions).toHaveBeenCalledWith('document-id', 1, 10)
  })
})
