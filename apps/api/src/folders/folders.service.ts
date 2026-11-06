import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import type { FolderSummary, WorkspaceRole } from '@syncspace/contracts'
import { WorkspacesService } from '../workspaces/workspaces.service'
import type { CreateFolderDto, UpdateFolderDto } from './folders.dto'
import { FoldersRepository } from './folders.repository'

@Injectable()
export class FoldersService {
  constructor(
    private readonly repository: FoldersRepository,
    private readonly workspaces: WorkspacesService,
  ) {}

  async list(workspaceId: string, userId: string): Promise<FolderSummary[]> {
    await this.requireMembership(workspaceId, userId)
    return this.repository.listForWorkspace(workspaceId)
  }

  async assertInWorkspace(folderId: string, workspaceId: string) {
    const folder = await this.repository.findInWorkspace(folderId, workspaceId)
    if (!folder) throw new NotFoundException('Folder not found in this workspace.')
    return folder
  }

  async create(workspaceId: string, userId: string, input: CreateFolderDto): Promise<FolderSummary> {
    await this.requireMembership(workspaceId, userId)
    if (input.parentFolderId) {
      const parent = await this.repository.findInWorkspace(input.parentFolderId, workspaceId)
      if (!parent) throw new NotFoundException('Parent folder not found in this workspace.')
    }
    try {
      return await this.repository.create({
        workspaceId,
        actorId: userId,
        name: input.name.trim(),
        parentFolderId: input.parentFolderId ?? null,
      })
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('A folder with that name already exists here.')
      throw error
    }
  }

  async update(folderId: string, userId: string, input: UpdateFolderDto): Promise<FolderSummary> {
    if (!Object.keys(input).length) throw new BadRequestException('Provide a folder name or parent folder to update.')
    const folder = await this.requireFolderAccess(folderId, userId)
    if (input.parentFolderId !== undefined) {
      if (input.parentFolderId === folderId) throw new BadRequestException('A folder cannot be moved into itself.')
      if (input.parentFolderId) {
        const parent = await this.repository.findInWorkspace(input.parentFolderId, folder.workspaceId)
        if (!parent) throw new NotFoundException('Parent folder not found in this workspace.')
        if (await this.repository.hasDescendant(folderId, input.parentFolderId, folder.workspaceId)) {
          throw new BadRequestException('A folder cannot be moved inside one of its descendants.')
        }
      }
    }

    try {
      const updated = await this.repository.update(folderId, userId, {
        name: input.name?.trim(),
        parentFolderId: input.parentFolderId,
      })
      if (!updated) throw new NotFoundException('Folder not found.')
      const [summary] = (await this.repository.listForWorkspace(folder.workspaceId))
        .filter((item) => item.id === updated.id)
      if (!summary) throw new NotFoundException('Folder not found.')
      return summary
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('A folder with that name already exists here.')
      throw error
    }
  }

  async remove(folderId: string, userId: string) {
    await this.requireFolderAccess(folderId, userId)
    const removed = await this.repository.delete(folderId, userId)
    if (!removed) throw new NotFoundException('Folder not found.')
  }

  private async requireFolderAccess(folderId: string, userId: string) {
    const folder = await this.repository.findById(folderId)
    if (!folder) throw new NotFoundException('Folder not found.')
    const role = await this.requireMembership(folder.workspaceId, userId)
    if (role === 'MEMBER' && folder.createdById !== userId) {
      throw new ForbiddenException('Only the folder creator or a workspace administrator can manage this folder.')
    }
    return folder
  }

  private async requireMembership(workspaceId: string, userId: string): Promise<WorkspaceRole> {
    const role = await this.workspaces.getMembership(workspaceId, userId)
    if (!role) throw new NotFoundException('Workspace not found.')
    return role
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505'
}
