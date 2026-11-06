"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const stream_1 = require("stream");
let StorageService = StorageService_1 = class StorageService {
    logger = new common_1.Logger(StorageService_1.name);
    connection = null;
    bucket = null;
    async onModuleInit() {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/syncspace';
        try {
            await mongoose_1.default.connect(uri);
            this.connection = mongoose_1.default.connection;
            this.bucket = new mongoose_1.default.mongo.GridFSBucket(this.connection.db, {
                bucketName: 'documents',
            });
            this.logger.log('MongoDB GridFS connected for document storage');
        }
        catch (err) {
            this.logger.warn(`MongoDB GridFS unavailable: ${err.message}`);
        }
    }
    async onModuleDestroy() {
        if (this.connection) {
            await mongoose_1.default.disconnect();
        }
    }
    isAvailable() {
        return this.bucket !== null;
    }
    async uploadFile(documentId, originalname, mimetype, buffer) {
        if (!this.bucket) {
            throw new Error('MongoDB GridFS is not available');
        }
        const filename = `${documentId}__${Date.now()}__${originalname}`;
        return new Promise((resolve, reject) => {
            const uploadStream = this.bucket.openUploadStream(filename, {
                metadata: { documentId, originalname, mimetype },
            });
            const readable = stream_1.Readable.from(buffer);
            readable.pipe(uploadStream);
            uploadStream.on('finish', () => {
                resolve({
                    fileId: uploadStream.id.toString(),
                    filename: originalname,
                    size: buffer.length,
                    mimetype,
                });
            });
            uploadStream.on('error', reject);
        });
    }
    getFileStream(fileId) {
        if (!this.bucket) {
            throw new Error('MongoDB GridFS is not available');
        }
        const objectId = new mongoose_1.default.Types.ObjectId(fileId);
        return this.bucket.openDownloadStream(objectId);
    }
    async listFiles(documentId) {
        if (!this.bucket)
            return [];
        const cursor = this.bucket.find({ 'metadata.documentId': documentId });
        const files = await cursor.toArray();
        return files.map((f) => ({
            fileId: f._id.toString(),
            filename: f.metadata?.originalname || f.filename,
            size: f.length,
            mimetype: f.metadata?.mimetype || 'application/octet-stream',
            uploadedAt: f.uploadDate,
        }));
    }
    async deleteFile(fileId) {
        if (!this.bucket) {
            throw new Error('MongoDB GridFS is not available');
        }
        const objectId = new mongoose_1.default.Types.ObjectId(fileId);
        await this.bucket.delete(objectId);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)()
], StorageService);
//# sourceMappingURL=storage.service.js.map