import { ExecutionContext, NotFoundException } from '@nestjs/common'
import { WorkspaceMembershipGuard } from '../src/auth/workspace-membership.guard'

describe('WorkspaceMembershipGuard', () => {
  const contextFor = (request: object) => ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as ExecutionContext

  it('allows a document request only for a workspace member', async () => {
    const prisma = {
      document: { findUnique: jest.fn().mockResolvedValue({ workspaceId: 'workspace-1' }) },
      documentFolder: { findUnique: jest.fn() },
      workspaceMember: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-1' }) },
    }
    const guard = new WorkspaceMembershipGuard(prisma as any)

    await expect(guard.canActivate(contextFor({
      user: { id: 'user-1' },
      params: { id: 'document-1' },
      query: {},
      body: {},
    }))).resolves.toBe(true)
    expect(prisma.workspaceMember.findFirst).toHaveBeenCalledWith({
      where: { workspaceId: 'workspace-1', userId: 'user-1' },
      select: { id: true },
    })
  })

  it('rejects a workspace ID supplied by a non-member', async () => {
    const prisma = {
      document: { findUnique: jest.fn() },
      documentFolder: { findUnique: jest.fn() },
      workspaceMember: { findFirst: jest.fn().mockResolvedValue(null) },
    }
    const guard = new WorkspaceMembershipGuard(prisma as any)

    await expect(guard.canActivate(contextFor({
      user: { id: 'user-1' },
      params: {},
      query: { workspaceId: 'workspace-other' },
      body: {},
    }))).rejects.toBeInstanceOf(NotFoundException)
  })
})
