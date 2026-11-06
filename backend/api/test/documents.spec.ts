import { DocumentsService } from '../src/documents/documents.service'

describe('DocumentsService', () => {
  let documentsService: DocumentsService
  let mockPrisma: any
  let mockRedis: any
  let mockJobs: any

  beforeEach(() => {
    mockPrisma = {
      document: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      documentVersion: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      documentUpdate: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (transaction: any) => unknown) => callback(mockPrisma)),
      workspace: {
        findFirst: jest.fn().mockResolvedValue({ id: 'ws-1' }),
      },
    }
    mockRedis = {
      publish: jest.fn().mockResolvedValue(1),
    }
    mockJobs = {
      dispatchDocumentProcess: jest.fn().mockResolvedValue(undefined),
    }

    documentsService = new DocumentsService(mockPrisma as any, mockRedis as any, mockJobs as any)
  })

  it('returns persisted documents without fabricated fallback rows', async () => {
    const docs = await documentsService.findAll()
    expect(docs).toEqual([])
    expect(mockPrisma.document.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { updatedAt: 'desc' },
    }))
  })

  it('creates a document, publishes realtime event and queues background job', async () => {
    mockPrisma.document.create.mockResolvedValue({
      id: 'doc-123',
      workspaceId: 'ws-1',
      title: 'Sprint Planning',
      category: 'Team notes',
      content: 'Agenda items',
      authorName: 'Rohit Kumar',
      initials: 'RK',
      tone: 'slate',
    })

    const doc = await documentsService.create(
      {
        title: 'Sprint Planning',
        category: 'Team notes',
        content: 'Agenda items',
      },
      { name: 'Rohit Kumar', initials: 'RK' },
    )

    expect(doc.title).toBe('Sprint Planning')
    expect(mockRedis.publish).toHaveBeenCalledWith('syncspace:events', expect.objectContaining({ type: 'document:created' }))
    expect(mockJobs.dispatchDocumentProcess).toHaveBeenCalled()
  })

  it('restores a version while preserving revision history and resetting the collaboration snapshot', async () => {
    const current = {
      id: 'doc-1',
      content: '<p>newer content</p>',
      title: 'Design',
      editor: 'rich-text',
    }
    mockPrisma.document.findUnique.mockResolvedValue(current)
    mockPrisma.documentVersion.findUnique.mockResolvedValue({
      id: 'version-1',
      documentId: 'doc-1',
      content: '<p>older content</p>',
    })
    mockPrisma.documentVersion.create.mockResolvedValue({})
    mockPrisma.documentUpdate.deleteMany.mockResolvedValue({ count: 2 })
    mockPrisma.document.update.mockResolvedValue({ ...current, content: '<p>older content</p>' })

    const result = await documentsService.restoreVersion('doc-1', 'version-1')

    expect(result.content).toBe('<p>older content</p>')
    expect(mockPrisma.documentVersion.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ content: '<p>newer content</p>' }),
    }))
    expect(mockPrisma.documentUpdate.deleteMany).toHaveBeenCalledWith({ where: { documentId: 'doc-1' } })
    expect(mockJobs.dispatchDocumentProcess).toHaveBeenCalledWith('doc-1', 'Design', '<p>older content</p>')
  })

  it('persists and broadcasts valid Yjs updates', async () => {
    mockPrisma.document.findUnique.mockResolvedValue({ id: 'doc-1' })
    mockPrisma.documentUpdate.create.mockResolvedValue({
      id: 'update-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await documentsService.appendUpdate('doc-1', { update: 'AQID' })

    expect(mockPrisma.documentUpdate.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ documentId: 'doc-1', update: Buffer.from([1, 2, 3]) }),
    }))
    expect(mockRedis.publish).toHaveBeenCalledWith('syncspace:events', expect.objectContaining({
      type: 'document:y-update',
    }))
  })
})
