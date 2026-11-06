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
exports.TasksService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const jobs_service_1 = require("../jobs/jobs.service");
let TasksService = class TasksService {
    prisma;
    redis;
    jobs;
    constructor(prisma, redis, jobs) {
        this.prisma = prisma;
        this.redis = redis;
        this.jobs = jobs;
    }
    async findByProject(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true },
        });
        if (!project)
            throw new common_1.NotFoundException(`Project ${projectId} was not found`);
        return this.prisma.task.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(projectId, dto) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true },
        });
        if (!project)
            throw new common_1.NotFoundException(`Project ${projectId} was not found`);
        const task = await this.prisma.task.create({
            data: {
                id: (0, node_crypto_1.randomUUID)(),
                projectId,
                title: dto.title,
                dueDate: dto.dueDate || null,
                assignedTo: dto.assignedTo || null,
                priority: dto.priority ?? 'MEDIUM',
            },
        });
        await this.redis.publish('syncspace:events', {
            type: 'task:created',
            payload: task,
        });
        await this.jobs.dispatchProjectStats(projectId);
        return task;
    }
    async update(id, dto) {
        const existing = await this.prisma.task.findUnique({ where: { id }, select: { id: true } });
        if (!existing)
            throw new common_1.NotFoundException(`Task ${id} was not found`);
        const task = await this.prisma.task.update({
            where: { id },
            data: { ...dto, updatedAt: new Date() },
        });
        await this.redis.publish('syncspace:events', {
            type: 'task:updated',
            payload: task,
        });
        await this.jobs.dispatchProjectStats(task.projectId);
        return task;
    }
    async remove(id) {
        const existing = await this.prisma.task.findUnique({ where: { id }, select: { id: true } });
        if (!existing)
            throw new common_1.NotFoundException(`Task ${id} was not found`);
        const task = await this.prisma.task.delete({ where: { id } });
        await this.redis.publish('syncspace:events', {
            type: 'task:deleted',
            payload: { id, projectId: task.projectId },
        });
        await this.jobs.dispatchProjectStats(task.projectId);
        return { success: true, id };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        jobs_service_1.JobsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map