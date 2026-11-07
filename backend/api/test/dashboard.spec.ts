import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { DashboardService } from '../src/dashboard/dashboard.service'
import { PrismaService } from '../src/prisma/prisma.service'

describe('DashboardService', () => {
  let service: DashboardService
  let prisma: PrismaService

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: {
            workspace: { findFirst: jest.fn().mockResolvedValue(null) },
            document: { count: jest.fn().mockResolvedValue(18), findMany: jest.fn().mockResolvedValue([]) },
            project: { count: jest.fn().mockResolvedValue(4), findMany: jest.fn().mockResolvedValue([]) },
            activity: { findMany: jest.fn().mockResolvedValue([]) },
          },
        },
      ],
    }).compile()

    service = testingModule.get<DashboardService>(DashboardService)
    prisma = testingModule.get<PrismaService>(PrismaService)
  })

  it('does not fall back to another tenant when the requested workspace is not a member of the caller', async () => {
    const workspaceFindFirst = jest.spyOn(prisma.workspace, 'findFirst')

    await expect(service.getSummary('user-1', 'private-workspace')).rejects.toBeInstanceOf(NotFoundException)
    expect(workspaceFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: [{ id: 'private-workspace' }, { slug: 'private-workspace' }],
        members: { some: { userId: 'user-1' } },
      }),
    }))
  })
})
