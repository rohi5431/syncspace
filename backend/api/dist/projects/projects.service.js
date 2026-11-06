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
exports.ProjectsService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const project_dto_1 = require("./dto/project.dto");
let ProjectsService = class ProjectsService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll(workspaceId) {
        const projects = await this.prisma.project.findMany({
            where: workspaceId ? { workspaceId } : undefined,
            include: { tasks: true, sections: { orderBy: { position: 'asc' } } },
            orderBy: { updatedAt: 'desc' },
        });
        return projects.map((project) => ({
            ...project,
            members: JSON.parse(project.members || '[]'),
        }));
    }
    async findOne(id) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                tasks: true,
                sections: { orderBy: { position: 'asc' } },
                documents: { orderBy: { updatedAt: 'desc' } },
            },
        });
        if (!project)
            throw new common_1.NotFoundException(`Project ${id} was not found`);
        return {
            ...project,
            members: JSON.parse(project.members || '[]'),
        };
    }
    async create(dto, user) {
        const workspace = dto.workspaceId
            ? await this.prisma.workspace.findUnique({ where: { id: dto.workspaceId } })
            : await this.prisma.workspace.findFirst();
        if (!workspace)
            throw new common_1.NotFoundException('A workspace is required to create a project');
        const members = dto.members ?? (user?.initials ? [user.initials] : []);
        const project = await this.prisma.$transaction(async (transaction) => {
            const created = await transaction.project.create({
                data: {
                    id: (0, node_crypto_1.randomUUID)(),
                    workspaceId: workspace.id,
                    title: dto.title,
                    description: dto.description ?? '',
                    progress: dto.progress ?? 0,
                    dueDate: dto.dueDate ?? 'No due date',
                    tone: dto.tone ?? 'indigo',
                    members: JSON.stringify(members),
                    template: dto.template ?? 'web-application-development',
                },
            });
            await transaction.projectSection.createMany({
                data: project_dto_1.PROJECT_SECTIONS.map((section, position) => ({
                    id: (0, node_crypto_1.randomUUID)(),
                    projectId: created.id,
                    key: section.key,
                    title: section.title,
                    position,
                })),
            });
            return transaction.project.findUniqueOrThrow({
                where: { id: created.id },
                include: { tasks: true, sections: { orderBy: { position: 'asc' } } },
            });
        });
        const result = { ...project, members: JSON.parse(project.members || '[]') };
        await this.redis.publish('syncspace:events', {
            type: 'project:created',
            payload: result,
        });
        return result;
    }
    async update(id, dto) {
        const current = await this.prisma.project.findUnique({ where: { id } });
        if (!current)
            throw new common_1.NotFoundException(`Project ${id} was not found`);
        const updated = await this.prisma.project.update({
            where: { id },
            data: {
                ...dto,
                members: dto.members ? JSON.stringify(dto.members) : undefined,
                updatedAt: new Date(),
            },
        });
        const result = { ...updated, members: JSON.parse(updated.members || '[]') };
        await this.redis.publish('syncspace:events', {
            type: 'project:updated',
            payload: result,
        });
        return result;
    }
    async remove(id) {
        const project = await this.prisma.project.findUnique({ where: { id }, select: { id: true } });
        if (!project)
            throw new common_1.NotFoundException(`Project ${id} was not found`);
        await this.prisma.project.delete({ where: { id } });
        await this.redis.publish('syncspace:events', {
            type: 'project:deleted',
            payload: { id },
        });
        return { success: true, id };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map