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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const client = require("prom-client");
let MetricsService = class MetricsService {
    registry;
    connectedClients;
    socketEventsTotal;
    constructor() {
        this.registry = new client.Registry();
        client.collectDefaultMetrics({ register: this.registry, prefix: 'syncspace_realtime_' });
        this.connectedClients = new client.Gauge({
            name: 'syncspace_realtime_connected_clients',
            help: 'Number of currently connected WebSocket clients',
            registers: [this.registry],
        });
        this.socketEventsTotal = new client.Counter({
            name: 'syncspace_realtime_socket_events_total',
            help: 'Total number of WebSocket events handled',
            labelNames: ['event'],
            registers: [this.registry],
        });
    }
    async getMetrics() {
        return this.registry.metrics();
    }
    getContentType() {
        return this.registry.contentType;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map