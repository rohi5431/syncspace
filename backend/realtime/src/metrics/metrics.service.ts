import { Injectable } from '@nestjs/common'
import * as client from 'prom-client'

@Injectable()
export class MetricsService {
  private readonly registry: client.Registry

  public readonly connectedClients: client.Gauge<string>
  public readonly socketEventsTotal: client.Counter<string>

  constructor() {
    this.registry = new client.Registry()
    client.collectDefaultMetrics({ register: this.registry, prefix: 'syncspace_realtime_' })

    this.connectedClients = new client.Gauge({
      name: 'syncspace_realtime_connected_clients',
      help: 'Number of currently connected WebSocket clients',
      registers: [this.registry],
    })

    this.socketEventsTotal = new client.Counter({
      name: 'syncspace_realtime_socket_events_total',
      help: 'Total number of WebSocket events handled',
      labelNames: ['event'],
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
