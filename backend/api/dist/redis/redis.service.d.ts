import { OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private readonly logger;
    private client;
    private isConnected;
    constructor();
    getClient(): Redis | null;
    isHealthy(): boolean;
    publish(channel: string, message: any): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
