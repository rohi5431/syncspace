import * as client from 'prom-client';
export declare class MetricsService {
    private readonly registry;
    readonly httpRequestsTotal: client.Counter<string>;
    readonly httpRequestDuration: client.Histogram<string>;
    constructor();
    getMetrics(): Promise<string>;
    getContentType(): string;
}
