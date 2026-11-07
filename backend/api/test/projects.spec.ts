import { ProjectsService } from '../src/projects/projects.service'

describe('ProjectsService', () => {
  let projectsService: ProjectsService
  let mockPrisma: any
  let mockRedis: any

  beforeEach(() => {
    mockPrisma = {
      project: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      projectSection: {
        createMany: jest.fn().mockResolvedValue({ count: 7 }),
      },
      $transaction: jest.fn(async (callback: (transaction: any) => unknown) => callback(mockPrisma)),
      workspaceMember: {
        findFirst: jest.fn().mockResolvedValue({ workspace: { id: 'ws-1' } }),
      },
      workspace: {
        findFirst: jest.fn().mockResolvedValue({ id: 'ws-1' }),
      },
    }
    mockRedis = {
      publish: jest.fn().mockResolvedValue(1),
    }

    projectsService = new ProjectsService(mockPrisma as any, mockRedis as any)
  })

  it('returns persisted projects without fabricated fallback rows', async () => {
    const projects = await projectsService.findAll('usr-1')
    expect(projects).toEqual([])
    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { workspaceId: undefined, workspace: { members: { some: { userId: 'usr-1' } } } },
    }))
  })

  it('creates project sections transactionally and publishes event', async () => {
    mockPrisma.project.create.mockResolvedValue({
      id: 'proj-1',
      workspaceId: 'ws-1',
      title: 'Design System',
      description: 'Shared UI components',
      progress: 0,
      dueDate: 'Due Dec 1',
      tone: 'indigo',
      members: JSON.stringify(['MC']),
      template: 'web-application-development',
    })
    mockPrisma.project.findUniqueOrThrow.mockResolvedValue({
      id: 'proj-1',
      workspaceId: 'ws-1',
      title: 'Design System',
      description: 'Shared UI components',
      progress: 0,
      dueDate: 'Due Dec 1',
      tone: 'indigo',
      members: JSON.stringify(['MC']),
      template: 'web-application-development',
      tasks: [],
      sections: [],
    })

    const project = await projectsService.create({
      title: 'Design System',
      description: 'Shared UI components',
      dueDate: 'Due Dec 1',
      members: ['MC'],
    }, 'usr-1')

    expect(project.title).toBe('Design System')
    const sectionData = mockPrisma.projectSection.createMany.mock.calls[0][0].data
    expect(sectionData).toHaveLength(7)
    expect(sectionData[0]).toEqual(expect.objectContaining({ key: 'overview', position: 0 }))
    expect(mockPrisma.$transaction).toHaveBeenCalled()
    expect(mockRedis.publish).toHaveBeenCalledWith('syncspace:events', expect.objectContaining({ type: 'project:created' }))
  })
})
