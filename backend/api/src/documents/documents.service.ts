import { randomUUID } from 'node:crypto'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { JobsService } from '../jobs/jobs.service'
import {
  CreateCommentDto,
  CreateDocumentDto,
  CreateDocumentUpdateDto,
  CreateFolderDto,
  RenameFolderDto,
  SetPermissionDto,
  UpdateDocumentDto,
} from './dto/document.dto'

interface DocumentActor {
  id?: string
  name?: string
  initials?: string
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jobs: JobsService,
  ) {}

  async findAll(workspaceId?: string, query?: string) {
    return this.prisma.document.findMany({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        ...(query?.trim()
          ? {
              OR: [
                { title: { contains: query.trim(), mode: 'insensitive' } },
                { category: { contains: query.trim(), mode: 'insensitive' } },
                { content: { contains: query.trim(), mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { folder: true, permissions: true },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { folder: true, permissions: true, comments: { orderBy: { createdAt: 'asc' } } },
    })
    if (!document) throw new NotFoundException(`Document ${id} was not found`)
    return document
  }

  async create(dto: CreateDocumentDto, user?: DocumentActor) {
    const workspace = dto.workspaceId
      ? await this.prisma.workspace.findUnique({ where: { id: dto.workspaceId } })
      : await this.prisma.workspace.findFirst()
    if (!workspace) throw new NotFoundException('A workspace is required to create a document')

    const content = dto.content ?? ''
    const authorName = dto.authorName ?? user?.name ?? 'Unknown user'
    const id = randomUUID()
    const document = await this.prisma.document.create({
      data: {
        id,
        workspaceId: workspace.id,
        projectId: dto.projectId,
        folderId: dto.folderId,
        title: dto.title,
        category: dto.category ?? 'Technical Documentation',
        type: dto.type ?? 'TECHNICAL_DOCUMENTATION',
        editor: dto.editor ?? 'rich-text',
        content,
        authorId: user?.id,
        authorName,
        initials: dto.initials ?? user?.initials ?? 'U',
        tone: dto.tone ?? 'indigo',
        versions: {
          create: {
            content,
            contentFormat: dto.editor === 'markdown' ? 'markdown' : 'html',
            authorId: user?.id,
            authorName,
          },
        },
      },
    })

    await this.publishDocumentEvent('document:created', document)
    await this.jobs.dispatchDocumentProcess(document.id, document.title, content)
    return document
  }

  async update(id: string, dto: UpdateDocumentDto, user?: DocumentActor) {
    const current = await this.prisma.document.findUnique({ where: { id } })
    if (!current) throw new NotFoundException(`Document ${id} was not found`)

    const updated = await this.prisma.$transaction(async (transaction) => {
      if (dto.content !== undefined && dto.content !== current.content) {
        await transaction.documentVersion.create({
          data: {
            documentId: id,
            content: current.content,
            contentFormat: current.editor === 'markdown' ? 'markdown' : 'html',
            authorId: user?.id,
            authorName: user?.name ?? 'Unknown user',
          },
        })
      }
      return transaction.document.update({
        where: { id },
        data: { ...dto, updatedAt: new Date() },
      })
    })
    await this.publishDocumentEvent('document:updated', updated)
    if (dto.content !== undefined && dto.content !== current.content) {
      await this.jobs.dispatchDocumentProcess(id, updated.title, dto.content)
    }
    return updated
  }

  async duplicate(id: string, user?: DocumentActor) {
    const source = await this.prisma.document.findUnique({ where: { id } })
    if (!source) throw new NotFoundException(`Document ${id} was not found`)
    return this.create(
      {
        title: `${source.title} (Copy)`,
        category: source.category,
        content: source.content,
        workspaceId: source.workspaceId,
        projectId: source.projectId ?? undefined,
        folderId: source.folderId ?? undefined,
        type: source.type as CreateDocumentDto['type'],
        editor: source.editor as CreateDocumentDto['editor'],
      },
      user,
    )
  }

  async remove(id: string) {
    await this.requireDocument(id)
    await this.prisma.document.delete({ where: { id } })
    await this.redis.publish('syncspace:events', {
      type: 'document:deleted',
      payload: { id },
    })
    return { success: true, id }
  }

  async listFolders(workspaceId: string) {
    return this.prisma.documentFolder.findMany({
      where: { workspaceId },
      include: { children: true },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    })
  }

  async createFolder(dto: CreateFolderDto) {
    if (dto.parentId) {
      const parent = await this.prisma.documentFolder.findUnique({ where: { id: dto.parentId } })
      if (!parent || parent.workspaceId !== dto.workspaceId) {
        throw new BadRequestException('Parent folder must belong to the same workspace')
      }
    }
    return this.prisma.documentFolder.create({
      data: {
        id: randomUUID(),
        workspaceId: dto.workspaceId,
        name: dto.name.trim(),
        parentId: dto.parentId,
      },
    })
  }

  async renameFolder(id: string, dto: RenameFolderDto) {
    const folder = await this.prisma.documentFolder.findUnique({ where: { id } })
    if (!folder) throw new NotFoundException(`Folder ${id} was not found`)
    return this.prisma.documentFolder.update({
      where: { id },
      data: { name: dto.name.trim() },
    })
  }

  async removeFolder(id: string) {
    await this.prisma.documentFolder.delete({ where: { id } })
    return { success: true, id }
  }

  async listVersions(documentId: string) {
    await this.requireDocument(documentId)
    return this.prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async restoreVersion(documentId: string, versionId: string, user?: DocumentActor) {
    const [current, version] = await Promise.all([
      this.prisma.document.findUnique({ where: { id: documentId } }),
      this.prisma.documentVersion.findUnique({ where: { id: versionId } }),
    ])
    if (!current) throw new NotFoundException(`Document ${documentId} was not found`)
    if (!version || version.documentId !== documentId) {
      throw new NotFoundException(`Version ${versionId} was not found`)
    }

    const updated = await this.prisma.$transaction(async (transaction) => {
      await transaction.documentVersion.create({
        data: {
          documentId,
          content: current.content,
          contentFormat: current.editor === 'markdown' ? 'markdown' : 'html',
          authorId: user?.id,
          authorName: user?.name ?? 'Unknown user',
        },
      })
      await transaction.documentUpdate.deleteMany({ where: { documentId } })
      return transaction.document.update({
        where: { id: documentId },
        data: { content: version.content, updatedAt: new Date() },
      })
    })
    await this.publishDocumentEvent('document:restored', updated)
    await this.jobs.dispatchDocumentProcess(documentId, updated.title, updated.content)
    return updated
  }

  async listComments(documentId: string) {
    await this.requireDocument(documentId)
    return this.prisma.documentComment.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async createComment(documentId: string, dto: CreateCommentDto, user?: DocumentActor) {
    await this.requireDocument(documentId)
    const comment = await this.prisma.documentComment.create({
      data: {
        id: randomUUID(),
        documentId,
        content: dto.content,
        anchor: dto.anchor,
        authorId: user?.id,
        authorName: user?.name ?? 'Unknown user',
      },
    })
    await this.redis.publish('syncspace:events', {
      type: 'document:comment-created',
      payload: comment,
    })
    return comment
  }

  async removeComment(documentId: string, commentId: string) {
    const result = await this.prisma.documentComment.deleteMany({
      where: { id: commentId, documentId },
    })
    if (result.count === 0) throw new NotFoundException(`Comment ${commentId} was not found`)
    return { success: true, id: commentId }
  }

  async listPermissions(documentId: string) {
    await this.requireDocument(documentId)
    return this.prisma.documentPermission.findMany({
      where: { documentId },
      orderBy: { email: 'asc' },
    })
  }

  async setPermission(documentId: string, dto: SetPermissionDto) {
    await this.requireDocument(documentId)
    return this.prisma.documentPermission.upsert({
      where: { documentId_email: { documentId, email: dto.email.toLowerCase() } },
      create: {
        id: randomUUID(),
        documentId,
        email: dto.email.toLowerCase(),
        role: dto.role,
      },
      update: { role: dto.role },
    })
  }

  async removePermission(documentId: string, email: string) {
    const result = await this.prisma.documentPermission.deleteMany({
      where: { documentId, email: email.toLowerCase() },
    })
    if (result.count === 0) throw new NotFoundException(`Permission for ${email} was not found`)
    return { success: true, email }
  }

  async listUpdates(documentId: string) {
    await this.requireDocument(documentId)
    const updates = await this.prisma.documentUpdate.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
      select: { update: true },
    })
    return updates.map(({ update }) => Buffer.from(update).toString('base64'))
  }

  async appendUpdate(documentId: string, dto: CreateDocumentUpdateDto) {
    await this.requireDocument(documentId)
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(dto.update)) {
      throw new BadRequestException('Update must be a valid base64-encoded Yjs update')
    }
    const update = Buffer.from(dto.update, 'base64')
    if (update.length === 0 || update.length > 5 * 1024 * 1024) {
      throw new BadRequestException('Update size must be between 1 byte and 5 MB')
    }
    const stored = await this.prisma.documentUpdate.create({
      data: { id: randomUUID(), documentId, update },
    })
    await this.redis.publish('syncspace:events', {
      type: 'document:y-update',
      payload: { documentId, update: dto.update },
    })
    return { id: stored.id, createdAt: stored.createdAt }
  }

  private async requireDocument(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!document) throw new NotFoundException(`Document ${id} was not found`)
    return document
  }

  private publishDocumentEvent(type: string, payload: object) {
    return this.redis.publish('syncspace:events', { type, payload })
  }
}
