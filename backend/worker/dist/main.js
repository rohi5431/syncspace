"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const worker_service_1 = require("./worker.service");
const health_server_1 = require("./health/health-server");
dotenv.config();
async function main() {
    console.log('Starting SyncSpace BullMQ Worker...');
    const workerService = new worker_service_1.WorkerService();
    await workerService.start();
    const port = Number(process.env.PORT) || 3004;
    const server = (0, health_server_1.startHealthServer)(workerService, port);
    const shutdown = async (signal) => {
        console.log(`Received ${signal}, shutting down worker gracefully...`);
        server.close();
        await workerService.stop();
        process.exit(0);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
main().catch((err) => {
    console.error('Fatal worker process error:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map