import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateActivityDto } from './dto/activity.dto';
export declare class ActivityService {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(workspaceId?: string, limit?: number): Promise<{
        id: string;
        name: string;
        initials: string;
        tone: string;
        createdAt: Date;
        userId: string | null;
        workspaceId: string;
        action: string;
        target: string;
    }[] | {
        id: string;
        name: string;
        initials: string;
        tone: string;
        action: string;
        target: string;
        createdAt: Date;
    }[]>;
    record(dto: CreateActivityDto, user?: any): Promise<any>;
}
