import { Job } from 'bullmq';
export declare class WorkerService {
    private worker;
    private prisma;
    private redis;
    private metrics;
    private isRunning;
    constructor();
    start(): Promise<void>;
    processJob(job: Job): Promise<any>;
    handleDocumentProcess(data: {
        documentId: string;
        title: string;
        content?: string;
    }): Promise<{
        documentId: string;
        wordCount: number;
        readingTimeMinutes: number;
    }>;
    handleProjectStats(data: {
        projectId: string;
    }): Promise<{
        projectId: string;
        progress: number;
    }>;
    handleNotification(data: {
        userId: string;
        title: string;
        message: string;
    }): Promise<{
        delivered: boolean;
        recipient: string;
    }>;
    handleActivityRecord(data: any): Promise<{
        recorded: boolean;
    }>;
    isHealthy(): boolean;
    stop(): Promise<void>;
}
