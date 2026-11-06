import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class StorageService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private connection;
    private bucket;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    isAvailable(): boolean;
    uploadFile(documentId: string, originalname: string, mimetype: string, buffer: Buffer): Promise<{
        fileId: string;
        filename: string;
        size: number;
        mimetype: string;
    }>;
    getFileStream(fileId: string): NodeJS.ReadableStream;
    listFiles(documentId: string): Promise<Array<{
        fileId: string;
        filename: string;
        size: number;
        mimetype: string;
        uploadedAt: Date;
    }>>;
    deleteFile(fileId: string): Promise<void>;
}
