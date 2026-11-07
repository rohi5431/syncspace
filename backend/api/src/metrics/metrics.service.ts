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

  async getAdminSnapshot() {
    const exposition = await this.registry.metrics()
    const readSamples = (name: string) => exposition.split('\n')
      .filter((line) => line && !line.startsWith('#') && line.startsWith(name))
      .map((line) => {
        const match = line.match(/^([^{\s]+)(?:\{([^}]*)\})?\s+([^\s]+)/)
        if (!match) return null
        const labels = Object.fromEntries(
          Array.from(match[2]?.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)="((?:\\.|[^"])*)"/g) ?? [])
            .map((label) => [label[1], label[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\')]),
        )
        return { labels, value: Number(match[3]) }
      })
      .filter((sample): sample is { labels: Record<string, string>; value: number } => sample !== null)
    const counters = readSamples('syncspace_api_http_requests_total').map((sample) => ({
      method: sample.labels.method ?? 'unknown',
      route: sample.labels.route ?? 'unknown',
      status: sample.labels.status ?? 'unknown',
      count: sample.value,
    }))
    const requestCount = counters.reduce((total, item) => total + item.count, 0)
    const errors4xx = counters.filter((item) => item.status.startsWith('4'))
      .reduce((total, item) => total + item.count, 0)
    const errors5xx = counters.filter((item) => item.status.startsWith('5'))
      .reduce((total, item) => total + item.count, 0)
    const sum = readSamples('syncspace_api_http_request_duration_seconds_sum')[0]?.value ?? 0
    const count = readSamples('syncspace_api_http_request_duration_seconds_count')[0]?.value ?? 0
    const histogramBuckets = readSamples('syncspace_api_http_request_duration_seconds_bucket')
      .map((sample) => ({ le: Number(sample.labels.le), count: sample.value }))
      .sort((left, right) => left.le - right.le)
    const percentile = (target: number) => {
      if (!count) return null
      const threshold = count * target
      const bucket = histogramBuckets.find((item) => item.count >= threshold)
      return bucket && Number.isFinite(bucket.le) ? bucket.le : null
    }

    return {
      requestCount,
      requestsPerSecond: Number((requestCount / Math.max(process.uptime(), 1)).toFixed(2)),
      averageLatencyMs: count ? Number((sum / count * 1000).toFixed(2)) : null,
      p95LatencyMs: percentile(0.95),
      p99LatencyMs: percentile(0.99),
      errors4xx,
      errors5xx,
      errorRate: requestCount ? Number(((errors4xx + errors5xx) / requestCount * 100).toFixed(2)) : 0,
      endpointCounts: counters.sort((a, b) => b.count - a.count).slice(0, 10),
      sampleWindow: 'Since API process start; no historical metrics are persisted',
    }
  }

  getContentType(): string {
    return this.registry.contentType
  }
}
