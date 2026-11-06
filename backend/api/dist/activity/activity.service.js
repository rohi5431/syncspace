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
var ActivityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
let ActivityService = ActivityService_1 = class ActivityService {
    prisma;
    redis;
    logger = new common_1.Logger(ActivityService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll(workspaceId, limit = 20) {
        try {
            const where = {};
            if (workspaceId)
                where.workspaceId = workspaceId;
            const activities = await this.prisma.activity.findMany({
                where,
                take: Number(limit) || 20,
                orderBy: { createdAt: 'desc' },
            });
            if (activities.length > 0)
                return activities;
        }
        catch (err) {
            this.logger.warn(`Database fallback in findAll activities: ${err.message}`);
        }
        return [
            {
                id: 'act-1',
                name: 'Maya Chen',
                initials: 'MC',
                tone: 'indigo',
                action: 'updated',
                target: 'Product roadmap — Q4 2026',
                createdAt: new Date(Date.now() - 24 * 60 * 1000),
            },
            {
                id: 'act-2',
                name: 'Jordan Lee',
                initials: 'JL',
                tone: 'emerald',
                action: 'completed a task in',
                target: 'Website refresh',
                createdAt: new Date(Date.now() - 60 * 60 * 1000),
            },
            {
                id: 'act-3',
                name: 'Aisha Shah',
                initials: 'AS',
                tone: 'amber',
                action: 'commented on',
                target: 'Launch campaign brief',
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            },
        ];
    }
    async record(dto, user) {
        const name = dto.name || user?.name || 'Rohit Kumar';
        const initials = dto.initials || user?.initials || 'RK';
        const tone = dto.tone || user?.tone || 'indigo';
        let activity = null;
        try {
            const workspace = await this.prisma.workspace.findFirst();
            const workspaceId = dto.workspaceId || workspace?.id || 'ws-northstar';
            activity = await this.prisma.activity.create({
                data: {
                    workspaceId,
                    userId: user?.id || null,
                    name,
                    initials,
                    tone,
                    action: dto.action,
                    target: dto.target,
                },
            });
        }
        catch (err) {
            this.logger.warn(`Database fallback in record activity: ${err.message}`);
            activity = {
                id: `act-${Date.now().toString(36)}`,
                name,
                initials,
                tone,
                action: dto.action,
                target: dto.target,
                createdAt: new Date(),
            };
        }
        await this.redis.publish('syncspace:events', {
            type: 'activity:created',
            payload: activity,
        });
        return activity;
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = ActivityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map