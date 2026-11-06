export declare const PROJECT_TEMPLATES: readonly ["web-application-development", "full-stack-development", "backend-engineering", "ai-ml-projects", "mobile-application-development", "devops-and-ci-cd", "database-engineering", "system-design-projects"];
export declare const PROJECT_SECTIONS: readonly [{
    readonly key: "overview";
    readonly title: "Overview";
}, {
    readonly key: "documents";
    readonly title: "Documents";
}, {
    readonly key: "tasks";
    readonly title: "Tasks";
}, {
    readonly key: "kanban";
    readonly title: "Kanban Board";
}, {
    readonly key: "team";
    readonly title: "Team Members";
}, {
    readonly key: "activity";
    readonly title: "Activity Feed";
}, {
    readonly key: "settings";
    readonly title: "Project Settings";
}];
export declare class CreateProjectDto {
    title: string;
    description?: string;
    dueDate?: string;
    progress?: number;
    workspaceId?: string;
    tone?: string;
    template?: (typeof PROJECT_TEMPLATES)[number];
    members?: string[];
}
export declare class UpdateProjectDto {
    title?: string;
    description?: string;
    progress?: number;
    dueDate?: string;
    tone?: string;
    template?: (typeof PROJECT_TEMPLATES)[number];
    members?: string[];
}
