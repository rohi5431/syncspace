import { Injectable } from '@nestjs/common'
import * as client from 'prom-client'

@Injectable()
export class MetricsService {
  private readonly registry: client.Registry

  public readonly httpRequestsTotal: client.Counter<string>
  public readonly httpRequestDuration: client.Histogram<string>

  constructor() {
    this.registry = new client.Registry()
    client.collectDefaultMetrics({ register: this.registry, prefix: 'syncspace_api_' })

    this.httpRequestsTotal = new client.Counter({
      name: 'syncspace_api_http_requests_total',
      help: 'Total number of HTTP requests processed by syncspace-api',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    })

    this.httpRequestDuration = new client.Histogram({
      name: 'syncspace_api_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [this.registry],
    })
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics()
  }

  getContentType(): string {
    return this.registry.contentType
  }
}
