import { jest } from '@jest/globals'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import type { WorkspaceSummary } from '@syncspace/contracts'
import { WorkspacesService } from './workspaces.service'

const workspace: WorkspaceSummary = {
  id: 'c3d7a55e-274b-49d7-ae71-0b1479ec7d4e',
  name: 'Design team',
  description: null,
  ownerId: 'owner-id',
  role: 'OWNER',
  createdAt: '2026-11-06T00:00:00.000Z',
  updatedAt: '2026-11-06T00:00:00.000Z',
}

describe('WorkspacesService', () => {
  const repository = {
    listForUser: jest.fn(),
    findForUser: jest.fn(),
    getMembership: jest.fn(),
    createForUser: jest.fn(),
    updateForMember: jest.fn(),
    deleteForMember: jest.fn(),
  }
  let service: WorkspacesService

  beforeEach(() => {
    jest.clearAllMocks()
    repository.listForUser.mockResolvedValue([workspace])
    repository.findForUser.mockResolvedValue(workspace)
    repository.getMembership.mockResolvedValue('OWNER')
    repository.createForUser.mockResolvedValue(workspace)
    repository.updateForMember.mockResolvedValue({ ...workspace, name: 'Updated team' })
    repository.deleteForMember.mockResolvedValue(true)
    service = new WorkspacesService(repository as never)
  })

  it('lists only workspaces queried for the authenticated user', async () => {
    await expect(service.list('user-a')).resolves.toEqual([workspace])
    expect(repository.listForUser).toHaveBeenCalledWith('user-a')
  })

  it('adds the creator as OWNER when creating a workspace', async () => {
    await service.create('user-a', { name: ' Design team ' })
    expect(repository.createForUser).toHaveBeenCalledWith({
      name: 'Design team',
      description: null,
      ownerId: 'user-a',
    })
  })

  it('hides a workspace from a user who is not a member', async () => {
    repository.findForUser.mockResolvedValue(null)

    await expect(service.get(workspace.id, 'user-b')).rejects.toBeInstanceOf(NotFoundException)
    expect(repository.findForUser).toHaveBeenCalledWith(workspace.id, 'user-b')
  })

  it('allows an ADMIN to update workspace details', async () => {
    repository.getMembership.mockResolvedValue('ADMIN')

    await expect(service.update(workspace.id, 'admin-id', { name: 'Updated team' }))
      .resolves.toMatchObject({ name: 'Updated team' })
    expect(repository.updateForMember).toHaveBeenCalledWith(workspace.id, 'admin-id', {
      name: 'Updated team',
      description: undefined,
    })
  })

  it('prevents a MEMBER from updating workspace details', async () => {
    repository.getMembership.mockResolvedValue('MEMBER')

    await expect(service.update(workspace.id, 'member-id', { name: 'Blocked' }))
      .rejects.toBeInstanceOf(ForbiddenException)
    expect(repository.updateForMember).not.toHaveBeenCalled()
  })

  it('allows only the OWNER to delete a workspace', async () => {
    repository.getMembership.mockResolvedValue('ADMIN')

    await expect(service.remove(workspace.id, 'admin-id')).rejects.toBeInstanceOf(ForbiddenException)
    expect(repository.deleteForMember).not.toHaveBeenCalled()
  })
})
