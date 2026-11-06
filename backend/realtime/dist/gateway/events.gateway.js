"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const metrics_service_1 = require("../metrics/metrics.service");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    metrics;
    logger = new common_1.Logger(EventsGateway_1.name);
    subRedis = null;
    server;
    constructor(metrics) {
        this.metrics = metrics;
    }
    afterInit() {
        this.logger.log('WebSocket Gateway initialized');
        this.setupRedisSubscriber();
    }
    setupRedisSubscriber() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        try {
            this.subRedis = new ioredis_1.default(redisUrl, {
                lazyConnect: true,
                maxRetriesPerRequest: 1,
                retryStrategy: () => null,
            });
            this.subRedis.on('message', (channel, message) => {
                try {
                    const parsed = JSON.parse(message);
                    if (this.server) {
                        this.server.emit('server:event', parsed);
                        if (parsed.payload?.workspaceId) {
                            this.server.to(`workspace:${parsed.payload.workspaceId}`).emit(parsed.type, parsed.payload);
                        }
                    }
                }
                catch {
                }
            });
            this.subRedis.connect()
                .then(() => {
                this.subRedis?.subscribe('syncspace:events');
                this.logger.log('Subscribed to Redis channel syncspace:events');
            })
                .catch((err) => {
                this.logger.warn(`Could not subscribe to Redis events: ${err.message}`);
            });
        }
        catch (err) {
            this.logger.warn(`Redis subscriber init skipped: ${err.message}`);
        }
    }
    handleConnection(client) {
        this.metrics.connectedClients.inc();
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.metrics.connectedClients.dec();
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleJoinWorkspace(client, data) {
        this.metrics.socketEventsTotal.inc({ event: 'join_workspace' });
        const room = `workspace:${data.workspaceId}`;
        client.join(room);
        client.emit('workspace:joined', { room, socketId: client.id });
        return { status: 'joined', room };
    }
    handleLeaveWorkspace(client, data) {
        this.metrics.socketEventsTotal.inc({ event: 'leave_workspace' });
        const room = `workspace:${data.workspaceId}`;
        client.leave(room);
        return { status: 'left', room };
    }
    handleJoinDocument(client, data) {
        this.metrics.socketEventsTotal.inc({ event: 'join_document' });
        const room = `doc:${data.documentId}`;
        client.join(room);
        client.to(room).emit('document:user_joined', { documentId: data.documentId, user: data.user, socketId: client.id });
        return { status: 'joined', room };
    }
    handleLeaveDocument(client, data) {
        this.metrics.socketEventsTotal.inc({ event: 'leave_document' });
        const room = `doc:${data.documentId}`;
        client.leave(room);
        client.to(room).emit('document:user_left', { documentId: data.documentId, user: data.user, socketId: client.id });
        return { status: 'left', room };
    }
    handleDocChange(client, data) {
        this.metrics.socketEventsTotal.inc({ event: 'doc_change' });
        const room = `doc:${data.documentId}`;
        client.to(room).emit('document:changed', data);
        return { received: true };
    }
    handlePresence(client, data) {
        this.metrics.socketEventsTotal.inc({ event: 'presence' });
        const room = `workspace:${data.workspaceId}`;
        client.to(room).emit('presence:updated', data);
        return { acknowledged: true };
    }
    handleChatMessage(client, data) {
        this.metrics.socketEventsTotal.inc({ event: 'chat_message' });
        const room = `workspace:${data.workspaceId}`;
        const payload = { ...data, timestamp: new Date().toISOString(), id: `msg-${Date.now().toString(36)}` };
        this.server.to(room).emit('chat:received', payload);
        return payload;
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_workspace'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinWorkspace", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_workspace'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveWorkspace", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_document'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinDocument", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_document'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveDocument", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('doc_change'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleDocChange", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('presence'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handlePresence", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleChatMessage", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map