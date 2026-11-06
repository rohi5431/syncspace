import { Response } from 'express';
import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    private readonly logger;
    constructor(storageService: StorageService);
    upload(documentId: string, file: Express.Multer.File): Promise<{
        documentId: string;
        downloadUrl: string;
        fileId: string;
        filename: string;
        size: number;
        mimetype: string;
    }>;
    listFiles(documentId: string): Promise<{
        documentId: string;
        count: number;
        files: {
            downloadUrl: string;
            fileId: string;
            filename: string;
            size: number;
            mimetype: string;
            uploadedAt: Date;
        }[];
    }>;
    downloadFile(documentId: string, fileId: string, res: Response): Promise<void>;
    deleteFile(documentId: string, fileId: string): Promise<{
        success: boolean;
        fileId: string;
        documentId: string;
    }>;
}
