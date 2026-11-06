import { OnModuleDestroy } from '@nestjs/common';
export declare class JobsService implements OnModuleDestroy {
    private readonly logger;
    private queue;
    constructor();
    dispatchDocumentProcess(documentId: string, title: string, content: string): Promise<void>;
    dispatchProjectStats(projectId: string): Promise<void>;
    dispatchNotification(userId: string, title: string, message: string): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
