import * as client from 'prom-client';
export declare class MetricsService {
    private readonly registry;
    readonly connectedClients: client.Gauge<string>;
    readonly socketEventsTotal: client.Counter<string>;
    constructor();
    getMetrics(): Promise<string>;
    getContentType(): string;
}
