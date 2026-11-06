import { Module } from '@nestjs/common'
import { HealthModule } from './health/health.module'
import { MetricsModule } from './metrics/metrics.module'
import { GatewayModule } from './gateway/gateway.module'

@Module({
  imports: [HealthModule, MetricsModule, GatewayModule],
})
export class AppModule {}
