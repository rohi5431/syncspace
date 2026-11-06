"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const dotenv = require("dotenv");
const app_module_1 = require("./app.module");
const metrics_service_1 = require("./metrics/metrics.service");
dotenv.config();
dotenv.config({ path: '../../.env' });
async function bootstrap() {
    const logger = new common_1.Logger('SyncSpaceAPI');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
    }));
    const metricsService = app.get(metrics_service_1.MetricsService);
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = (Date.now() - start) / 1000;
            const route = req.route ? req.route.path : req.path;
            const status = String(res.statusCode);
            metricsService.httpRequestsTotal.inc({ method: req.method, route, status });
            metricsService.httpRequestDuration.observe({ method: req.method, route, status }, duration);
        });
        next();
    });
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    logger.log(`SyncSpace API server listening on http://0.0.0.0:${port}`);
}
bootstrap().catch((err) => {
    console.error('Fatal API bootstrap error:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map