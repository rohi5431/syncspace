"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const dotenv = require("dotenv");
const app_module_1 = require("./app.module");
const redis_io_adapter_1 = require("./gateway/redis-io.adapter");
dotenv.config();
async function bootstrap() {
    const logger = new common_1.Logger('SyncSpaceRealtime');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    });
    const redisIoAdapter = new redis_io_adapter_1.RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    const port = process.env.PORT || 3002;
    await app.listen(port, '0.0.0.0');
    logger.log(`SyncSpace Realtime Gateway listening on http://0.0.0.0:${port}`);
}
bootstrap().catch((err) => {
    console.error('Fatal Realtime bootstrap error:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map