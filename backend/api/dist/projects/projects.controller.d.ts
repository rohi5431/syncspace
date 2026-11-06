import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(workspaceId?: string): Promise<{
        members: string[];
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            title: string;
            dueDate: string | null;
            completed: boolean;
            assignedTo: string | null;
            priority: string;
        }[];
        sections: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            title: string;
            position: number;
            key: string;
        }[];
        id: string;
        tone: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        title: string;
        description: string;
        progress: number;
        dueDate: string;
        template: string;
    }[]>;
    create(dto: CreateProjectDto, req: any): Promise<{
        members: string[];
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            title: string;
            dueDate: string | null;
            completed: boolean;
            assignedTo: string | null;
            priority: string;
        }[];
        sections: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            title: string;
            position: number;
            key: string;
        }[];
        id: string;
        tone: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        title: string;
        description: string;
        progress: number;
        dueDate: string;
        template: string;
    }>;
    findOne(id: string): Promise<{
        members: string[];
        documents: {
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
        }[];
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            title: string;
            dueDate: string | null;
            completed: boolean;
            assignedTo: string | null;
            priority: string;
        }[];
        sections: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            title: string;
            position: number;
            key: string;
        }[];
        id: string;
        tone: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        title: string;
        description: string;
        progress: number;
        dueDate: string;
        template: string;
    }>;
    update(id: string, dto: UpdateProjectDto): Promise<{
        members: string[];
        id: string;
        tone: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        title: string;
        description: string;
        progress: number;
        dueDate: string;
        template: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
}
