import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(workspace?: string): Promise<{
        workspace: {
            id: string;
            name: string;
            slug: string;
            plan: string;
            seatQuota: number;
            currentSeats: number;
        };
        stats: {
            documents: {
                total: number;
                trendPercent: string;
                changeNote: string;
            };
            projects: {
                total: number;
                active: number;
                completed: number;
            };
            tasks: {
                pending: number;
                completed: number;
                overdue: number;
            };
            team: {
                total: number;
                online: number;
            };
        };
        recentDocuments: {
            id: string;
            title: string;
            category: string;
            authorName: string;
            initials: string;
            tone: string;
            updatedAt: string;
            collaborators: number;
            accessLevel: string;
            starred: boolean;
        }[];
        projects: {
            id: string;
            title: string;
            description: string;
            progress: number;
            dueDate: string;
            tone: string;
            status: string;
            members: string[];
            taskCount: number;
        }[];
        tasks: {
            id: string;
            title: string;
            projectName: string;
            projectTone: string;
            completed: boolean;
            dueDate: string;
            priority: string;
            assignee: {
                name: string;
                initials: string;
            };
        }[];
        activities: {
            id: string;
            name: string;
            initials: string;
            tone: string;
            action: string;
            target: string;
            createdAt: string;
        }[];
        teamMembers: {
            id: string;
            name: string;
            email: string;
            initials: string;
            role: string;
            tone: string;
            online: boolean;
            lastActive: string;
        }[];
        storage: {
            usedBytes: number;
            totalBytes: number;
            usedFormatted: string;
            totalFormatted: string;
            percent: number;
        };
        collaboration: {
            status: string;
            latencyMs: number;
            gatewayUrl: string;
            activeRooms: number;
            connectedClients: number;
            synced: boolean;
        };
    }>;
}
