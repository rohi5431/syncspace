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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StorageController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const storage_service_1 = require("./storage.service");
const multer_1 = require("multer");
let StorageController = StorageController_1 = class StorageController {
    storageService;
    logger = new common_1.Logger(StorageController_1.name);
    constructor(storageService) {
        this.storageService = storageService;
    }
    async upload(documentId, file) {
        if (!file) {
            throw new common_1.HttpException('No file provided', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!this.storageService.isAvailable()) {
            throw new common_1.HttpException('File storage (MongoDB) is not available. Check MONGODB_URI in your .env', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            const result = await this.storageService.uploadFile(documentId, file.originalname, file.mimetype, file.buffer);
            this.logger.log(`Uploaded file "${file.originalname}" for document ${documentId}`);
            return {
                ...result,
                documentId,
                downloadUrl: `/api/documents/${documentId}/files/${result.fileId}`,
            };
        }
        catch (err) {
            throw new common_1.HttpException(`Upload failed: ${err.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async listFiles(documentId) {
        const files = await this.storageService.listFiles(documentId);
        return {
            documentId,
            count: files.length,
            files: files.map((f) => ({
                ...f,
                downloadUrl: `/api/documents/${documentId}/files/${f.fileId}`,
            })),
        };
    }
    async downloadFile(documentId, fileId, res) {
        if (!this.storageService.isAvailable()) {
            throw new common_1.HttpException('File storage (MongoDB) is not available', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            const files = await this.storageService.listFiles(documentId);
            const meta = files.find((f) => f.fileId === fileId);
            if (meta) {
                res.set({
                    'Content-Type': meta.mimetype,
                    'Content-Disposition': `inline; filename="${meta.filename}"`,
                    'Content-Length': String(meta.size),
                });
            }
            const stream = this.storageService.getFileStream(fileId);
            stream.pipe(res);
        }
        catch (err) {
            throw new common_1.HttpException(`File not found: ${err.message}`, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteFile(documentId, fileId) {
        if (!this.storageService.isAvailable()) {
            throw new common_1.HttpException('File storage (MongoDB) is not available', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            await this.storageService.deleteFile(fileId);
            this.logger.log(`Deleted file ${fileId} from document ${documentId}`);
            return { success: true, fileId, documentId };
        }
        catch (err) {
            throw new common_1.HttpException(`Delete failed: ${err.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 50 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Get)(':fileId'),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Delete)(':fileId'),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "deleteFile", null);
exports.StorageController = StorageController = StorageController_1 = __decorate([
    (0, common_1.Controller)('api/documents/:documentId/files'),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map