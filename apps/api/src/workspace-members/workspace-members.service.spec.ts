import { jest } from '@jest/globals'
import { ForbiddenException } from '@nestjs/common'
import { WorkspaceMembersService } from './workspace-members.service'

describe('WorkspaceMembersService', () => {
  const repository = {
    list: jest.fn(),
    findById: jest.fn(),
    findByWorkspaceUser: jest.fn(),
    add: jest.fn(),
    updateRole: jest.fn(),
    remove: jest.fn(),
  }
  const workspaces = { getMembership: jest.fn() }
  const users = { findByEmail: jest.fn() }
  let service: WorkspaceMembersService

  beforeEach(() => {
    jest.clearAllMocks()
    workspaces.getMembership.mockResolvedValue('OWNER')
    users.findByEmail.mockResolvedValue({ id: 'user-b', name: 'B User', email: 'b@example.com' })
    repository.findByWorkspaceUser.mockResolvedValue(null)
    repository.add.mockResolvedValue({ id: 'member-id', userId: 'user-b', role: 'MEMBER' })
    repository.findById.mockResolvedValue({ id: 'member-id', userId: 'user-b', role: 'MEMBER' })
    repository.updateRole.mockResolvedValue({ id: 'member-id', role: 'ADMIN' })
    repository.remove.mockResolvedValue(true)
    service = new WorkspaceMembersService(repository as never, workspaces as never, users as never)
  })

  it('adds an existing account as a workspace MEMBER', async () => {
    await service.add('workspace-id', 'owner-id', { email: 'b@example.com' })
    expect(repository.add).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      userId: 'user-b',
      actorId: 'owner-id',
      role: 'MEMBER',
    })
  })

  it('prevents a MEMBER from adding workspace members', async () => {
    workspaces.getMembership.mockResolvedValue('MEMBER')
    await expect(service.add('workspace-id', 'member-id', { email: 'b@example.com' }))
      .rejects.toBeInstanceOf(ForbiddenException)
    expect(repository.add).not.toHaveBeenCalled()
  })

  it('allows only the OWNER to promote a member to ADMIN', async () => {
    workspaces.getMembership.mockResolvedValue('ADMIN')
    await expect(service.updateRole('workspace-id', 'member-id', 'admin-id', { role: 'ADMIN' }))
      .rejects.toBeInstanceOf(ForbiddenException)
    expect(repository.updateRole).not.toHaveBeenCalled()
  })

  it('allows an OWNER to change a member role', async () => {
    await service.updateRole('workspace-id', 'member-id', 'owner-id', { role: 'ADMIN' })
    expect(repository.updateRole).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      memberId: 'member-id',
      actorId: 'owner-id',
      role: 'ADMIN',
    })
  })
})
