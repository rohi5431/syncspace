import { jest } from '@jest/globals'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { FoldersService } from './folders.service'

const folder = {
  id: 'folder-id',
  name: 'Research',
  workspaceId: 'workspace-id',
  parentFolderId: null,
  createdById: 'user-a',
  createdAt: new Date('2026-11-06T00:00:00.000Z'),
  updatedAt: new Date('2026-11-06T00:00:00.000Z'),
}
const summary = { ...folder, createdBy: { id: 'user-a', name: 'A User', email: 'a@example.com', avatarUrl: null }, createdAt: folder.createdAt.toISOString(), updatedAt: folder.updatedAt.toISOString() }

describe('FoldersService', () => {
  const repository = {
    listForWorkspace: jest.fn(),
    findInWorkspace: jest.fn(),
    findById: jest.fn(),
    findParent: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    hasDescendant: jest.fn(),
  }
  const workspaces = { getMembership: jest.fn() }
  let service: FoldersService

  beforeEach(() => {
    jest.clearAllMocks()
    workspaces.getMembership.mockResolvedValue('MEMBER')
    repository.listForWorkspace.mockResolvedValue([summary])
    repository.findInWorkspace.mockResolvedValue({ id: 'parent-id' })
    repository.findById.mockResolvedValue(folder)
    repository.hasDescendant.mockResolvedValue(false)
    repository.create.mockResolvedValue(summary)
    repository.update.mockResolvedValue(folder)
    repository.delete.mockResolvedValue(true)
    service = new FoldersService(repository as never, workspaces as never)
  })

  it('creates nested folders only under a folder in the same workspace', async () => {
    await service.create('workspace-id', 'user-a', { name: ' Planning ', parentFolderId: 'parent-id' })
    expect(repository.findInWorkspace).toHaveBeenCalledWith('parent-id', 'workspace-id')
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      actorId: 'user-a',
      name: 'Planning',
      parentFolderId: 'parent-id',
    })
  })

  it('prevents moving a folder beneath one of its descendants', async () => {
    repository.findById.mockResolvedValue({ ...folder, createdById: 'user-a' })
    repository.hasDescendant.mockResolvedValue(true)
    await expect(service.update('folder-id', 'user-a', { parentFolderId: 'descendant-id' }))
      .rejects.toBeInstanceOf(BadRequestException)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('prevents members from modifying another member’s folder', async () => {
    repository.findById.mockResolvedValue({ ...folder, createdById: 'user-b' })
    await expect(service.remove('folder-id', 'user-a')).rejects.toBeInstanceOf(ForbiddenException)
    expect(repository.delete).not.toHaveBeenCalled()
  })

  it('hides folders from users outside the workspace', async () => {
    workspaces.getMembership.mockResolvedValue(null)
    await expect(service.list('workspace-id', 'outsider')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('deletes a folder through the safe repository operation', async () => {
    await service.remove('folder-id', 'user-a')
    expect(repository.delete).toHaveBeenCalledWith('folder-id', 'user-a')
  })
})
