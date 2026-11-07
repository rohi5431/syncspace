import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { WorkspacesService } from '../src/workspaces/workspaces.service'

describe('WorkspacesService tenant access', () => {
  let service: WorkspacesService
  let prisma: any

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ role: 'ADMIN' }),
      },
      workspace: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
      workspaceMember: {
        findMany: jest.fn(),
      },
    }
    service = new WorkspacesService(prisma)
  })

  it('creates a workspace tenant owned by the authenticated user', async () => {
    const workspace = { id: 'workspace-1', name: 'Acme', slug: 'acme' }
    prisma.workspace.create.mockResolvedValue(workspace)

    await expect(service.create({ name: 'Acme' }, 'user-1')).resolves.toBe(workspace)
    expect(prisma.workspace.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Acme',
        ownerId: 'user-1',
        members: { create: { userId: 'user-1', role: 'OWNER' } },
      }),
    })
  })

  it('does not let a regular member create a workspace', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'MEMBER' })

    await expect(service.create({ name: 'Restricted' }, 'user-1')).rejects.toBeInstanceOf(ForbiddenException)
    expect(prisma.workspace.create).not.toHaveBeenCalled()
  })

  it('does not return another user’s workspace by ID or slug', async () => {
    prisma.workspace.findFirst.mockResolvedValue(null)

    await expect(service.findOne('private-workspace', 'user-1')).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.workspace.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: [{ id: 'private-workspace' }, { slug: 'private-workspace' }],
        members: { some: { userId: 'user-1' } },
      }),
    }))
  })
})
