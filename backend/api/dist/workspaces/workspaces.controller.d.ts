import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto, AddMemberDto } from './dto/workspace.dto';
export declare class WorkspacesController {
    private readonly workspacesService;
    constructor(workspacesService: WorkspacesService);
    findAll(userId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }[]>;
    create(dto: CreateWorkspaceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }>;
    findOne(id: string): Promise<({
        _count: {
            documents: number;
            members: number;
            projects: number;
        };
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                initials: string;
                tone: string;
            };
        } & {
            id: string;
            role: string;
            joinedAt: Date;
            userId: string;
            workspaceId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }) | {
        id: string;
        name: string;
        slug: string;
        ownerId: string;
        members: {
            id: string;
            role: string;
            user: {
                name: string;
                email: string;
                initials: string;
                tone: string;
            };
        }[];
        _count: {
            documents: number;
            projects: number;
            members: number;
        };
    }>;
    update(id: string, dto: UpdateWorkspaceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    } | {
        updatedAt: Date;
        name?: string;
        slug?: string;
        id: string;
    }>;
    getMembers(id: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            initials: string;
            tone: string;
        };
    } & {
        id: string;
        role: string;
        joinedAt: Date;
        userId: string;
        workspaceId: string;
    })[] | {
        id: string;
        role: string;
        user: {
            name: string;
            email: string;
            initials: string;
            tone: string;
        };
    }[]>;
    addMember(id: string, dto: AddMemberDto): Promise<{
        id: string;
        role: string;
        joinedAt: Date;
        userId: string;
        workspaceId: string;
    } | {
        id: string;
        workspaceId: string;
        role: string;
        joinedAt: Date;
    }>;
    removeMember(id: string, memberId: string): Promise<{
        success: boolean;
    }>;
}
