import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MetricsService } from '../metrics/metrics.service';
export declare class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly metrics;
    private readonly logger;
    private subRedis;
    server: Server;
    constructor(metrics: MetricsService);
    afterInit(): void;
    private setupRedisSubscriber;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinWorkspace(client: Socket, data: {
        workspaceId: string;
    }): {
        status: string;
        room: string;
    };
    handleLeaveWorkspace(client: Socket, data: {
        workspaceId: string;
    }): {
        status: string;
        room: string;
    };
    handleJoinDocument(client: Socket, data: {
        documentId: string;
        user?: any;
    }): {
        status: string;
        room: string;
    };
    handleLeaveDocument(client: Socket, data: {
        documentId: string;
        user?: any;
    }): {
        status: string;
        room: string;
    };
    handleDocChange(client: Socket, data: {
        documentId: string;
        delta: any;
    }): {
        received: boolean;
    };
    handlePresence(client: Socket, data: {
        workspaceId: string;
        user: any;
        status: string;
    }): {
        acknowledged: boolean;
    };
    handleChatMessage(client: Socket, data: {
        workspaceId: string;
        message: string;
        author: string;
    }): {
        timestamp: string;
        id: string;
        workspaceId: string;
        message: string;
        author: string;
    };
}
