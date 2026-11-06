import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findByProject(projectId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        title: string;
        dueDate: string | null;
        completed: boolean;
        assignedTo: string | null;
        priority: string;
    }[]>;
    create(projectId: string, dto: CreateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        title: string;
        dueDate: string | null;
        completed: boolean;
        assignedTo: string | null;
        priority: string;
    }>;
    update(id: string, dto: UpdateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        title: string;
        dueDate: string | null;
        completed: boolean;
        assignedTo: string | null;
        priority: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
}
