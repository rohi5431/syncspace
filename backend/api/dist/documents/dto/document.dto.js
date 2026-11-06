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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDocumentDto = exports.CreateDocumentUpdateDto = exports.SetPermissionDto = exports.CreateCommentDto = exports.RenameFolderDto = exports.CreateFolderDto = exports.CreateDocumentDto = exports.DOCUMENT_EDITORS = exports.DOCUMENT_TYPES = void 0;
const class_validator_1 = require("class-validator");
exports.DOCUMENT_TYPES = [
    'SRS',
    'HLD',
    'LLD',
    'API_DOCUMENTATION',
    'DATABASE_DESIGN',
    'README',
    'TECHNICAL_DOCUMENTATION',
    'MEETING_NOTES',
    'SPRINT_REPORT',
    'RELEASE_NOTES',
    'BUG_REPORT',
    'ARCHITECTURE_DIAGRAM',
];
exports.DOCUMENT_EDITORS = ['rich-text', 'markdown', 'code', 'diagram', 'file'];
class CreateDocumentDto {
    title;
    category;
    content;
    workspaceId;
    projectId;
    folderId;
    type;
    editor;
    authorName;
    initials;
    tone;
}
exports.CreateDocumentDto = CreateDocumentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "workspaceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "folderId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.DOCUMENT_TYPES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateDocumentDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.DOCUMENT_EDITORS),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateDocumentDto.prototype, "editor", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "authorName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "initials", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "tone", void 0);
class CreateFolderDto {
    name;
    workspaceId;
    parentId;
}
exports.CreateFolderDto = CreateFolderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "workspaceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "parentId", void 0);
class RenameFolderDto {
    name;
}
exports.RenameFolderDto = RenameFolderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RenameFolderDto.prototype, "name", void 0);
class CreateCommentDto {
    content;
    anchor;
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "anchor", void 0);
class SetPermissionDto {
    email;
    role;
}
exports.SetPermissionDto = SetPermissionDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SetPermissionDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['VIEWER', 'EDITOR']),
    __metadata("design:type", String)
], SetPermissionDto.prototype, "role", void 0);
class CreateDocumentUpdateDto {
    update;
}
exports.CreateDocumentUpdateDto = CreateDocumentUpdateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDocumentUpdateDto.prototype, "update", void 0);
class UpdateDocumentDto {
    title;
    category;
    content;
    tone;
    projectId;
    folderId;
    type;
    editor;
    starred;
}
exports.UpdateDocumentDto = UpdateDocumentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "tone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "folderId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.DOCUMENT_TYPES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateDocumentDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.DOCUMENT_EDITORS),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateDocumentDto.prototype, "editor", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDocumentDto.prototype, "starred", void 0);
//# sourceMappingURL=document.dto.js.map