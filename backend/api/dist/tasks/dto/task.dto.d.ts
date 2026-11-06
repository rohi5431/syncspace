export declare class CreateTaskDto {
    title: string;
    dueDate?: string;
    assignedTo?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}
export declare class UpdateTaskDto {
    title?: string;
    completed?: boolean;
    dueDate?: string;
    assignedTo?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}
