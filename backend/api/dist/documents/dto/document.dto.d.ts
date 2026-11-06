export declare const DOCUMENT_TYPES: readonly ["SRS", "HLD", "LLD", "API_DOCUMENTATION", "DATABASE_DESIGN", "README", "TECHNICAL_DOCUMENTATION", "MEETING_NOTES", "SPRINT_REPORT", "RELEASE_NOTES", "BUG_REPORT", "ARCHITECTURE_DIAGRAM"];
export declare const DOCUMENT_EDITORS: readonly ["rich-text", "markdown", "code", "diagram", "file"];
export declare class CreateDocumentDto {
    title: string;
    category?: string;
    content?: string;
    workspaceId?: string;
    projectId?: string;
    folderId?: string;
    type?: (typeof DOCUMENT_TYPES)[number];
    editor?: (typeof DOCUMENT_EDITORS)[number];
    authorName?: string;
    initials?: string;
    tone?: string;
}
export declare class CreateFolderDto {
    name: string;
    workspaceId: string;
    parentId?: string;
}
export declare class RenameFolderDto {
    name: string;
}
export declare class CreateCommentDto {
    content: string;
    anchor?: string;
}
export declare class SetPermissionDto {
    email: string;
    role: 'VIEWER' | 'EDITOR';
}
export declare class CreateDocumentUpdateDto {
    update: string;
}
export declare class UpdateDocumentDto {
    title?: string;
    category?: string;
    content?: string;
    tone?: string;
    projectId?: string;
    folderId?: string;
    type?: (typeof DOCUMENT_TYPES)[number];
    editor?: (typeof DOCUMENT_EDITORS)[number];
    starred?: boolean;
}
