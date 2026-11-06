import { DocumentsService } from './documents.service';
import { CreateCommentDto, CreateDocumentDto, CreateDocumentUpdateDto, CreateFolderDto, RenameFolderDto, SetPermissionDto, UpdateDocumentDto } from './dto/document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    findAll(workspaceId?: string, q?: string): Promise<({
        folder: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            parentId: string | null;
        };
        permissions: {
            id: string;
            email: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
            documentId: string;
        }[];
    } & {
        id: string;
        initials: string;
        tone: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        projectId: string | null;
        folderId: string | null;
        title: string;
        category: string;
        type: string;
        editor: string;
        content: string;
        starred: boolean;
        authorId: string | null;
        authorName: string;
    })[]>;
    create(dto: CreateDocumentDto, req: {
        user?: {
            id?: string;
            name?: string;
            initials?: string;
        };
    }): Promise<{
        id: string;
        initials: string;
        tone: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        projectId: string | null;
        folderId: string | null;
        title: string;
        category: string;
        type: string;
        editor: string;
        content: string;
        starred: boolean;
        authorId: string | null;
        authorName: string;
    }>;
    listFolders(workspaceId: string): Promise<({
        children: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            parentId: string | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        parentId: string | null;
    })[]>;
    createFolder(dto: CreateFolderDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        parentId: string | null;
    }>;
    renameFolder(folderId: string, dto: RenameFolderDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        parentId: string | null;
    }>;
    removeFolder(folderId: string): Promise<{
        success: boolean;
        id: string;
    }>;
    listVersions(id: string): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        authorId: string | null;
        authorName: string;
        documentId: string;
        contentFormat: string;
    }[]>;
    restoreVersion(id: string, versionId: string, req: {
        user?: {
            id?: string;
            name?: string;
        };
    }): Promise<{
        id: string;
        initials: string;
        tone: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        projectId: string | null;
        folderId: string | null;
        title: string;
        category: string;
        type: string;
        editor: string;
        content: string;
        starred: boolean;
        authorId: string | null;
        authorName: string;
    }>;
    listComments(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        anchor: string | null;
        content: string;
        authorId: string | null;
        authorName: string;
        documentId: string;
    }[]>;
    createComment(id: string, dto: CreateCommentDto, req: {
        user?: {
            id?: string;
            name?: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        anchor: string | null;
        content: string;
        authorId: string | null;
        authorName: string;
        documentId: string;
    }>;
    removeComment(id: string, commentId: string): Promise<{
        success: boolean;
        id: string;
    }>;
    listPermissions(id: string): Promise<{
        id: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        documentId: string;
    }[]>;
    setPermission(id: string, dto: SetPermissionDto): Promise<{
        id: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        documentId: string;
    }>;
    removePermission(id: string, email: string): Promise<{
        success: boolean;
        email: string;
    }>;
    listUpdates(id: string): Promise<string[]>;
    appendUpdate(id: string, dto: CreateDocumentUpdateDto): Promise<{
        id: string;
        createdAt: Date;
    }>;
    duplicate(id: string, req: {
        user?: {
            id?: string;
            name?: string;
            initials?: string;
        };
    }): Promise<{
        id: string;
        initials: string;
        tone: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        projectId: string | null;
        folderId: string | null;
        title: string;
        category: string;
        type: string;
        editor: string;
        content: string;
        starred: boolean;
        authorId: string | null;
        authorName: string;
    }>;
    findOne(id: string): Promise<{
        folder: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            parentId: string | null;
        };
        comments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            anchor: string | null;
            content: string;
            authorId: string | null;
            authorName: string;
            documentId: string;
        }[];
        permissions: {
            id: string;
            email: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
            documentId: string;
        }[];
    } & {
        id: string;
        initials: string;
        tone: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        projectId: string | null;
        folderId: string | null;
        title: string;
        category: string;
        type: string;
        editor: string;
        content: string;
        starred: boolean;
        authorId: string | null;
        authorName: string;
    }>;
    update(id: string, dto: UpdateDocumentDto, req: {
        user?: {
            id?: string;
            name?: string;
        };
    }): Promise<{
        id: string;
        initials: string;
        tone: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        projectId: string | null;
        folderId: string | null;
        title: string;
        category: string;
        type: string;
        editor: string;
        content: string;
        starred: boolean;
        authorId: string | null;
        authorName: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
}
