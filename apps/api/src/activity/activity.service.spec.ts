import { jest } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import { ActivityService } from './activity.service'

describe('ActivityService', () => {
  const repository = { list: jest.fn() }
  const workspaces = { getMembership: jest.fn() }
  let service: ActivityService

  beforeEach(() => {
    jest.clearAllMocks()
    workspaces.getMembership.mockResolvedValue('MEMBER')
    repository.list.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, pageCount: 0 })
    service = new ActivityService(repository as never, workspaces as never)
  })

  it('returns paginated activity only after confirming workspace membership', async () => {
    const query = { page: 2, pageSize: 10 }
    await service.list('workspace-id', 'user-id', query)
    expect(repository.list).toHaveBeenCalledWith('workspace-id', 'user-id', 'MEMBER', query)
  })

  it('hides workspace activity from a non-member', async () => {
    workspaces.getMembership.mockResolvedValue(null)
    await expect(service.list('workspace-id', 'outsider', { page: 1, pageSize: 20 }))
      .rejects.toBeInstanceOf(NotFoundException)
    expect(repository.list).not.toHaveBeenCalled()
  })
})
