"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./redis/redis.module");
const metrics_module_1 = require("./metrics/metrics.module");
const health_module_1 = require("./health/health.module");
const jobs_module_1 = require("./jobs/jobs.module");
const auth_module_1 = require("./auth/auth.module");
const workspaces_module_1 = require("./workspaces/workspaces.module");
const documents_module_1 = require("./documents/documents.module");
const projects_module_1 = require("./projects/projects.module");
const tasks_module_1 = require("./tasks/tasks.module");
const activity_module_1 = require("./activity/activity.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const storage_module_1 = require("./storage/storage.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            metrics_module_1.MetricsModule,
            health_module_1.HealthModule,
            jobs_module_1.JobsModule,
            auth_module_1.AuthModule,
            workspaces_module_1.WorkspacesModule,
            documents_module_1.DocumentsModule,
            projects_module_1.ProjectsModule,
            tasks_module_1.TasksModule,
            activity_module_1.ActivityModule,
            dashboard_module_1.DashboardModule,
            storage_module_1.StorageModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map