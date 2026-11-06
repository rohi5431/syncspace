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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const documents_service_1 = require("./documents.service");
const document_dto_1 = require("./dto/document.dto");
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    findAll(workspaceId, q) {
        return this.documentsService.findAll(workspaceId, q);
    }
    create(dto, req) {
        return this.documentsService.create(dto, req.user);
    }
    listFolders(workspaceId) {
        return this.documentsService.listFolders(workspaceId);
    }
    createFolder(dto) {
        return this.documentsService.createFolder(dto);
    }
    renameFolder(folderId, dto) {
        return this.documentsService.renameFolder(folderId, dto);
    }
    removeFolder(folderId) {
        return this.documentsService.removeFolder(folderId);
    }
    listVersions(id) {
        return this.documentsService.listVersions(id);
    }
    restoreVersion(id, versionId, req) {
        return this.documentsService.restoreVersion(id, versionId, req.user);
    }
    listComments(id) {
        return this.documentsService.listComments(id);
    }
    createComment(id, dto, req) {
        return this.documentsService.createComment(id, dto, req.user);
    }
    removeComment(id, commentId) {
        return this.documentsService.removeComment(id, commentId);
    }
    listPermissions(id) {
        return this.documentsService.listPermissions(id);
    }
    setPermission(id, dto) {
        return this.documentsService.setPermission(id, dto);
    }
    removePermission(id, email) {
        return this.documentsService.removePermission(id, email);
    }
    listUpdates(id) {
        return this.documentsService.listUpdates(id);
    }
    appendUpdate(id, dto) {
        return this.documentsService.appendUpdate(id, dto);
    }
    duplicate(id, req) {
        return this.documentsService.duplicate(id, req.user);
    }
    findOne(id) {
        return this.documentsService.findOne(id);
    }
    update(id, dto, req) {
        return this.documentsService.update(id, dto, req.user);
    }
    remove(id) {
        return this.documentsService.remove(id);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('workspaceId')),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_dto_1.CreateDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('folders'),
    __param(0, (0, common_1.Query)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "listFolders", null);
__decorate([
    (0, common_1.Post)('folders'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_dto_1.CreateFolderDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Patch)('folders/:folderId'),
    __param(0, (0, common_1.Param)('folderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, document_dto_1.RenameFolderDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "renameFolder", null);
__decorate([
    (0, common_1.Delete)('folders/:folderId'),
    __param(0, (0, common_1.Param)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "removeFolder", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "listVersions", null);
__decorate([
    (0, common_1.Post)(':id/versions/:versionId/restore'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "restoreVersion", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "listComments", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, document_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "createComment", null);
__decorate([
    (0, common_1.Delete)(':id/comments/:commentId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "removeComment", null);
__decorate([
    (0, common_1.Get)(':id/permissions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "listPermissions", null);
__decorate([
    (0, common_1.Put)(':id/permissions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, document_dto_1.SetPermissionDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "setPermission", null);
__decorate([
    (0, common_1.Delete)(':id/permissions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "removePermission", null);
__decorate([
    (0, common_1.Get)(':id/updates'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "listUpdates", null);
__decorate([
    (0, common_1.Post)(':id/updates'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, document_dto_1.CreateDocumentUpdateDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "appendUpdate", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, document_dto_1.UpdateDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "remove", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('api/documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map