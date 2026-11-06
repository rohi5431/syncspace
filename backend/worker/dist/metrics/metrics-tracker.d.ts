import * as client from 'prom-client';
export declare class WorkerMetrics {
    private static instance;
    readonly registry: client.Registry;
    readonly jobsProcessedTotal: client.Counter<string>;
    readonly jobsFailedTotal: client.Counter<string>;
    readonly jobDuration: client.Histogram<string>;
    private constructor();
    static getInstance(): WorkerMetrics;
    getMetrics(): Promise<string>;
    getContentType(): string;
}
