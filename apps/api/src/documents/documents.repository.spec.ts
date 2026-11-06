import { jest } from '@jest/globals'
import { DocumentsRepository } from './documents.repository'
import { activityLogs } from '../database/schema'

const createdAt = new Date('2026-11-06T00:00:00.000Z')
const createdDocument = {
  id: 'document-id',
  title: 'Architecture',
  description: null,
  content: { type: 'doc', content: [] },
  workspaceId: 'workspace-id',
  folderId: null,
  createdById: 'user-id',
  isArchived: false,
  isDeleted: false,
  createdAt,
  updatedAt: createdAt,
}

describe('DocumentsRepository', () => {
  it('writes a document-created activity entry in the same database transaction', async () => {
    const createdInsert = {
      values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([createdDocument]) }),
    }
    const activityInsert = { values: jest.fn().mockResolvedValue(undefined) }
    const transaction = { insert: jest.fn() }
    transaction.insert.mockReturnValueOnce(createdInsert).mockReturnValueOnce(activityInsert)
    const database = {
      db: {
        transaction: jest.fn(async (callback: (transaction: typeof transaction) => Promise<unknown>) => callback(transaction)),
      },
    }
    const repository = new DocumentsRepository(database as never)
    jest.spyOn(repository, 'findAccess').mockResolvedValue({
      document: {
        ...createdDocument,
        createdBy: { id: 'user-id', name: 'User', email: 'user@example.com', avatarUrl: null },
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
        permissionRole: null,
        canRead: true,
        canEdit: true,
        canManageSharing: true,
        canDelete: true,
      },
      workspaceRole: 'OWNER',
      canRead: true,
      canEdit: true,
      canManageSharing: true,
      canDelete: true,
    })

    await repository.create({
      workspaceId: 'workspace-id',
      userId: 'user-id',
      title: 'Architecture',
      description: null,
      folderId: null,
    })

    expect(transaction.insert).toHaveBeenNthCalledWith(2, activityLogs)
    expect(activityInsert.values).toHaveBeenCalledWith(expect.objectContaining({
      action: 'document.created',
      resourceType: 'document',
      resourceId: 'document-id',
      actorId: 'user-id',
    }))
  })
})
