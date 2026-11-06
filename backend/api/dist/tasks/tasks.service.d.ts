import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JobsService } from '../jobs/jobs.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
export declare class TasksService {
    private readonly prisma;
    private readonly redis;
    private readonly jobs;
    constructor(prisma: PrismaService, redis: RedisService, jobs: JobsService);
    findByProject(projectId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        title: string;
        dueDate: string | null;
        completed: boolean;
        assignedTo: string | null;
        priority: string;
    }[]>;
    create(projectId: string, dto: CreateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        title: string;
        dueDate: string | null;
        completed: boolean;
        assignedTo: string | null;
        priority: string;
    }>;
    update(id: string, dto: UpdateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        title: string;
        dueDate: string | null;
        completed: boolean;
        assignedTo: string | null;
        priority: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
}
