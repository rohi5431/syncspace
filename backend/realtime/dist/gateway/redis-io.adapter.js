"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = require("ioredis");
const common_1 = require("@nestjs/common");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    redisLogger = new common_1.Logger(RedisIoAdapter.name);
    adapterConstructor = null;
    async connectToRedis() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        try {
            const pubClient = new ioredis_1.default(redisUrl, {
                lazyConnect: true,
                maxRetriesPerRequest: 1,
                retryStrategy: () => null,
            });
            const subClient = pubClient.duplicate();
            await Promise.all([pubClient.connect(), subClient.connect()]);
            this.adapterConstructor = (0, redis_adapter_1.createAdapter)(pubClient, subClient);
            this.redisLogger.log('Connected Socket.IO to Redis adapter');
        }
        catch (err) {
            this.redisLogger.warn(`Redis adapter unavailable, using in-memory socket adapter: ${err.message}`);
        }
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, {
            ...options,
            cors: { origin: '*', methods: ['GET', 'POST'] },
        });
        if (this.adapterConstructor) {
            server.adapter(this.adapterConstructor);
        }
        return server;
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
//# sourceMappingURL=redis-io.adapter.js.map