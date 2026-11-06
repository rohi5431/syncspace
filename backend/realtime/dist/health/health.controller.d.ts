export declare class HealthController {
    check(): {
        status: string;
        service: string;
        timestamp: string;
        uptime: number;
    };
    live(): {
        status: string;
    };
    ready(): {
        status: string;
        checks: {
            websocket: string;
        };
    };
}
