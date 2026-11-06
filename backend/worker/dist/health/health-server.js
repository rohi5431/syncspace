"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHealthServer = startHealthServer;
const http = require("http");
const metrics_tracker_1 = require("../metrics/metrics-tracker");
function startHealthServer(workerService, port = 3004) {
    const metrics = metrics_tracker_1.WorkerMetrics.getInstance();
    const server = http.createServer(async (req, res) => {
        const url = req.url?.split('?')[0];
        if (url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                service: 'syncspace-worker',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            }));
            return;
        }
        if (url === '/health/live') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok' }));
            return;
        }
        if (url === '/health/ready') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                checks: {
                    worker: workerService.isHealthy() ? 'up' : 'initializing',
                },
            }));
            return;
        }
        if (url === '/metrics') {
            const output = await metrics.getMetrics();
            res.writeHead(200, { 'Content-Type': metrics.getContentType() });
            res.end(output);
            return;
        }
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    });
    server.listen(port, '0.0.0.0', () => {
        console.log(`SyncSpace Worker health & metrics server listening on http://0.0.0.0:${port}`);
    });
    return server;
}
//# sourceMappingURL=health-server.js.map