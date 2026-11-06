"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerMetrics = void 0;
const client = require("prom-client");
class WorkerMetrics {
    static instance;
    registry;
    jobsProcessedTotal;
    jobsFailedTotal;
    jobDuration;
    constructor() {
        this.registry = new client.Registry();
        client.collectDefaultMetrics({ register: this.registry, prefix: 'syncspace_worker_' });
        this.jobsProcessedTotal = new client.Counter({
            name: 'syncspace_worker_jobs_processed_total',
            help: 'Total number of background jobs processed by syncspace-worker',
            labelNames: ['jobName'],
            registers: [this.registry],
        });
        this.jobsFailedTotal = new client.Counter({
            name: 'syncspace_worker_jobs_failed_total',
            help: 'Total number of background jobs that failed',
            labelNames: ['jobName'],
            registers: [this.registry],
        });
        this.jobDuration = new client.Histogram({
            name: 'syncspace_worker_job_duration_seconds',
            help: 'Duration of background jobs in seconds',
            labelNames: ['jobName'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10],
            registers: [this.registry],
        });
    }
    static getInstance() {
        if (!WorkerMetrics.instance) {
            WorkerMetrics.instance = new WorkerMetrics();
        }
        return WorkerMetrics.instance;
    }
    async getMetrics() {
        return this.registry.metrics();
    }
    getContentType() {
        return this.registry.contentType;
    }
}
exports.WorkerMetrics = WorkerMetrics;
//# sourceMappingURL=metrics-tracker.js.map