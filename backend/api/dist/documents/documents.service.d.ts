import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JobsService } from '../jobs/jobs.service';
import { CreateCommentDto, CreateDocumentDto, CreateDocumentUpdateDto, CreateFolderDto, RenameFolderDto, SetPermissionDto, UpdateDocumentDto } from './dto/document.dto';
interface DocumentActor {
    id?: string;
    name?: string;
    initials?: string;
}
export declare class DocumentsService {
    private readonly prisma;
    private readonly redis;
    private readonly jobs;
    constructor(prisma: PrismaService, redis: RedisService, jobs: JobsService);
    findAll(workspaceId?: string, query?: string): Promise<({
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
    create(dto: CreateDocumentDto, user?: DocumentActor): Promise<{
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
    update(id: string, dto: UpdateDocumentDto, user?: DocumentActor): Promise<{
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
    duplicate(id: string, user?: DocumentActor): Promise<{
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
    renameFolder(id: string, dto: RenameFolderDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        parentId: string | null;
    }>;
    removeFolder(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    listVersions(documentId: string): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        authorId: string | null;
        authorName: string;
        documentId: string;
        contentFormat: string;
    }[]>;
    restoreVersion(documentId: string, versionId: string, user?: DocumentActor): Promise<{
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
    listComments(documentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        anchor: string | null;
        content: string;
        authorId: string | null;
        authorName: string;
        documentId: string;
    }[]>;
    createComment(documentId: string, dto: CreateCommentDto, user?: DocumentActor): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        anchor: string | null;
        content: string;
        authorId: string | null;
        authorName: string;
        documentId: string;
    }>;
    removeComment(documentId: string, commentId: string): Promise<{
        success: boolean;
        id: string;
    }>;
    listPermissions(documentId: string): Promise<{
        id: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        documentId: string;
    }[]>;
    setPermission(documentId: string, dto: SetPermissionDto): Promise<{
        id: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        documentId: string;
    }>;
    removePermission(documentId: string, email: string): Promise<{
        success: boolean;
        email: string;
    }>;
    listUpdates(documentId: string): Promise<string[]>;
    appendUpdate(documentId: string, dto: CreateDocumentUpdateDto): Promise<{
        id: string;
        createdAt: Date;
    }>;
    private requireDocument;
    private publishDocumentEvent;
}
export {};
