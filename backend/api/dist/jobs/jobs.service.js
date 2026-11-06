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
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
let JobsService = JobsService_1 = class JobsService {
    logger = new common_1.Logger(JobsService_1.name);
    queue = null;
    constructor() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        try {
            const url = new URL(redisUrl);
            this.queue = new bullmq_1.Queue('syncspace-jobs', {
                connection: {
                    host: url.hostname || 'localhost',
                    port: Number(url.port) || 6379,
                    password: url.password || undefined,
                    lazyConnect: true,
                    maxRetriesPerRequest: 1,
                },
            });
        }
        catch (err) {
            this.logger.warn(`Could not initialize BullMQ queue: ${err.message}`);
        }
    }
    async dispatchDocumentProcess(documentId, title, content) {
        if (!this.queue)
            return;
        try {
            await this.queue.add('document.process', { documentId, title, content });
            this.logger.log(`Dispatched document.process job for doc ${documentId}`);
        }
        catch (err) {
            this.logger.warn(`Failed to dispatch document.process job: ${err.message}`);
        }
    }
    async dispatchProjectStats(projectId) {
        if (!this.queue)
            return;
        try {
            await this.queue.add('project.update-stats', { projectId });
            this.logger.log(`Dispatched project.update-stats job for project ${projectId}`);
        }
        catch (err) {
            this.logger.warn(`Failed to dispatch project.update-stats job: ${err.message}`);
        }
    }
    async dispatchNotification(userId, title, message) {
        if (!this.queue)
            return;
        try {
            await this.queue.add('notification.send', { userId, title, message });
        }
        catch (err) {
            this.logger.warn(`Failed to dispatch notification job: ${err.message}`);
        }
    }
    async onModuleDestroy() {
        if (this.queue) {
            await this.queue.close();
        }
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JobsService);
//# sourceMappingURL=jobs.service.js.map