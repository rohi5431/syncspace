import { Test, TestingModule } from '@nestjs/testing'
import { DashboardService } from '../src/dashboard/dashboard.service'
import { PrismaService } from '../src/prisma/prisma.service'

describe('DashboardService', () => {
  let service: DashboardService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<DashboardService>(DashboardService)
  })

  it('should return complete workspace summary', async () => {
    const summary = await service.getSummary('northstar-studio')
    expect(summary).toBeDefined()
    expect(summary.workspace.name).toBe('Northstar Studio')
    expect(summary.stats.documents.total).toBeGreaterThanOrEqual(0)
    expect(summary.stats.projects.total).toBeGreaterThanOrEqual(0)
    expect(summary.teamMembers.length).toBeGreaterThan(0)
  })
})
