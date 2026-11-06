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
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    logger = new common_1.Logger(RedisService_1.name);
    client = null;
    isConnected = false;
    constructor() {
        const url = process.env.REDIS_URL || 'redis://localhost:6379';
        try {
            this.client = new ioredis_1.default(url, {
                lazyConnect: true,
                maxRetriesPerRequest: 1,
                retryStrategy: (times) => {
                    if (times > 3)
                        return null;
                    return Math.min(times * 100, 1000);
                },
            });
            this.client.on('connect', () => {
                this.isConnected = true;
                this.logger.log('Connected to Redis');
            });
            this.client.on('error', (err) => {
                this.isConnected = false;
                this.logger.warn(`Redis connection error: ${err.message}`);
            });
            this.client.connect().catch((err) => {
                this.logger.warn(`Failed initial Redis connection: ${err.message}`);
            });
        }
        catch (err) {
            this.logger.warn(`Failed to initialize Redis client: ${err.message}`);
        }
    }
    getClient() {
        return this.client;
    }
    isHealthy() {
        return this.isConnected;
    }
    async publish(channel, message) {
        if (!this.client || !this.isConnected)
            return;
        try {
            const payload = typeof message === 'string' ? message : JSON.stringify(message);
            await this.client.publish(channel, payload);
        }
        catch (err) {
            this.logger.warn(`Failed to publish message to ${channel}: ${err.message}`);
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            try {
                await this.client.quit();
            }
            catch {
                this.client.disconnect();
            }
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map