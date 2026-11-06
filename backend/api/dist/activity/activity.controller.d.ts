import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/activity.dto';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    findAll(workspaceId?: string, limit?: number): Promise<{
        id: string;
        name: string;
        initials: string;
        tone: string;
        createdAt: Date;
        userId: string | null;
        workspaceId: string;
        action: string;
        target: string;
    }[] | {
        id: string;
        name: string;
        initials: string;
        tone: string;
        action: string;
        target: string;
        createdAt: Date;
    }[]>;
    record(dto: CreateActivityDto, req: any): Promise<any>;
}
