import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto, AddMemberDto } from './dto/workspace.dto';
export declare class WorkspacesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(userId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
    }[]>;
    findOne(idOrSlug: string): Promise<({
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
    create(dto: CreateWorkspaceDto, userId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
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
    getMembers(workspaceId: string): Promise<({
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
    addMember(workspaceId: string, dto: AddMemberDto): Promise<{
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
    removeMember(workspaceId: string, memberId: string): Promise<{
        success: boolean;
    }>;
}
