"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const jobs_service_1 = require("../jobs/jobs.service");
let DocumentsService = class DocumentsService {
    prisma;
    redis;
    jobs;
    constructor(prisma, redis, jobs) {
        this.prisma = prisma;
        this.redis = redis;
        this.jobs = jobs;
    }
    async findAll(workspaceId, query) {
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
        });
    }
    async findOne(id) {
        const document = await this.prisma.document.findUnique({
            where: { id },
            include: { folder: true, permissions: true, comments: { orderBy: { createdAt: 'asc' } } },
        });
        if (!document)
            throw new common_1.NotFoundException(`Document ${id} was not found`);
        return document;
    }
    async create(dto, user) {
        const workspace = dto.workspaceId
            ? await this.prisma.workspace.findUnique({ where: { id: dto.workspaceId } })
            : await this.prisma.workspace.findFirst();
        if (!workspace)
            throw new common_1.NotFoundException('A workspace is required to create a document');
        const content = dto.content ?? '';
        const authorName = dto.authorName ?? user?.name ?? 'Unknown user';
        const id = (0, node_crypto_1.randomUUID)();
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
        });
        await this.publishDocumentEvent('document:created', document);
        await this.jobs.dispatchDocumentProcess(document.id, document.title, content);
        return document;
    }
    async update(id, dto, user) {
        const current = await this.prisma.document.findUnique({ where: { id } });
        if (!current)
            throw new common_1.NotFoundException(`Document ${id} was not found`);
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
                });
            }
            return transaction.document.update({
                where: { id },
                data: { ...dto, updatedAt: new Date() },
            });
        });
        await this.publishDocumentEvent('document:updated', updated);
        if (dto.content !== undefined && dto.content !== current.content) {
            await this.jobs.dispatchDocumentProcess(id, updated.title, dto.content);
        }
        return updated;
    }
    async duplicate(id, user) {
        const source = await this.prisma.document.findUnique({ where: { id } });
        if (!source)
            throw new common_1.NotFoundException(`Document ${id} was not found`);
        return this.create({
            title: `${source.title} (Copy)`,
            category: source.category,
            content: source.content,
            workspaceId: source.workspaceId,
            projectId: source.projectId ?? undefined,
            folderId: source.folderId ?? undefined,
            type: source.type,
            editor: source.editor,
        }, user);
    }
    async remove(id) {
        await this.requireDocument(id);
        await this.prisma.document.delete({ where: { id } });
        await this.redis.publish('syncspace:events', {
            type: 'document:deleted',
            payload: { id },
        });
        return { success: true, id };
    }
    async listFolders(workspaceId) {
        return this.prisma.documentFolder.findMany({
            where: { workspaceId },
            include: { children: true },
            orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
        });
    }
    async createFolder(dto) {
        if (dto.parentId) {
            const parent = await this.prisma.documentFolder.findUnique({ where: { id: dto.parentId } });
            if (!parent || parent.workspaceId !== dto.workspaceId) {
                throw new common_1.BadRequestException('Parent folder must belong to the same workspace');
            }
        }
        return this.prisma.documentFolder.create({
            data: {
                id: (0, node_crypto_1.randomUUID)(),
                workspaceId: dto.workspaceId,
                name: dto.name.trim(),
                parentId: dto.parentId,
            },
        });
    }
    async renameFolder(id, dto) {
        const folder = await this.prisma.documentFolder.findUnique({ where: { id } });
        if (!folder)
            throw new common_1.NotFoundException(`Folder ${id} was not found`);
        return this.prisma.documentFolder.update({
            where: { id },
            data: { name: dto.name.trim() },
        });
    }
    async removeFolder(id) {
        await this.prisma.documentFolder.delete({ where: { id } });
        return { success: true, id };
    }
    async listVersions(documentId) {
        await this.requireDocument(documentId);
        return this.prisma.documentVersion.findMany({
            where: { documentId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async restoreVersion(documentId, versionId, user) {
        const [current, version] = await Promise.all([
            this.prisma.document.findUnique({ where: { id: documentId } }),
            this.prisma.documentVersion.findUnique({ where: { id: versionId } }),
        ]);
        if (!current)
            throw new common_1.NotFoundException(`Document ${documentId} was not found`);
        if (!version || version.documentId !== documentId) {
            throw new common_1.NotFoundException(`Version ${versionId} was not found`);
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
            });
            await transaction.documentUpdate.deleteMany({ where: { documentId } });
            return transaction.document.update({
                where: { id: documentId },
                data: { content: version.content, updatedAt: new Date() },
            });
        });
        await this.publishDocumentEvent('document:restored', updated);
        await this.jobs.dispatchDocumentProcess(documentId, updated.title, updated.content);
        return updated;
    }
    async listComments(documentId) {
        await this.requireDocument(documentId);
        return this.prisma.documentComment.findMany({
            where: { documentId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createComment(documentId, dto, user) {
        await this.requireDocument(documentId);
        const comment = await this.prisma.documentComment.create({
            data: {
                id: (0, node_crypto_1.randomUUID)(),
                documentId,
                content: dto.content,
                anchor: dto.anchor,
                authorId: user?.id,
                authorName: user?.name ?? 'Unknown user',
            },
        });
        await this.redis.publish('syncspace:events', {
            type: 'document:comment-created',
            payload: comment,
        });
        return comment;
    }
    async removeComment(documentId, commentId) {
        const result = await this.prisma.documentComment.deleteMany({
            where: { id: commentId, documentId },
        });
        if (result.count === 0)
            throw new common_1.NotFoundException(`Comment ${commentId} was not found`);
        return { success: true, id: commentId };
    }
    async listPermissions(documentId) {
        await this.requireDocument(documentId);
        return this.prisma.documentPermission.findMany({
            where: { documentId },
            orderBy: { email: 'asc' },
        });
    }
    async setPermission(documentId, dto) {
        await this.requireDocument(documentId);
        return this.prisma.documentPermission.upsert({
            where: { documentId_email: { documentId, email: dto.email.toLowerCase() } },
            create: {
                id: (0, node_crypto_1.randomUUID)(),
                documentId,
                email: dto.email.toLowerCase(),
                role: dto.role,
            },
            update: { role: dto.role },
        });
    }
    async removePermission(documentId, email) {
        const result = await this.prisma.documentPermission.deleteMany({
            where: { documentId, email: email.toLowerCase() },
        });
        if (result.count === 0)
            throw new common_1.NotFoundException(`Permission for ${email} was not found`);
        return { success: true, email };
    }
    async listUpdates(documentId) {
        await this.requireDocument(documentId);
        const updates = await this.prisma.documentUpdate.findMany({
            where: { documentId },
            orderBy: { createdAt: 'asc' },
            select: { update: true },
        });
        return updates.map(({ update }) => Buffer.from(update).toString('base64'));
    }
    async appendUpdate(documentId, dto) {
        await this.requireDocument(documentId);
        if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(dto.update)) {
            throw new common_1.BadRequestException('Update must be a valid base64-encoded Yjs update');
        }
        const update = Buffer.from(dto.update, 'base64');
        if (update.length === 0 || update.length > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('Update size must be between 1 byte and 5 MB');
        }
        const stored = await this.prisma.documentUpdate.create({
            data: { id: (0, node_crypto_1.randomUUID)(), documentId, update },
        });
        await this.redis.publish('syncspace:events', {
            type: 'document:y-update',
            payload: { documentId, update: dto.update },
        });
        return { id: stored.id, createdAt: stored.createdAt };
    }
    async requireDocument(id) {
        const document = await this.prisma.document.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!document)
            throw new common_1.NotFoundException(`Document ${id} was not found`);
        return document;
    }
    publishDocumentEvent(type, payload) {
        return this.redis.publish('syncspace:events', { type, payload });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        jobs_service_1.JobsService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map