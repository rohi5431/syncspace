import { HealthController } from '../src/health/health.controller'
import { MetricsController } from '../src/metrics/metrics.controller'
import { MetricsService } from '../src/metrics/metrics.service'

describe('Realtime Health and Metrics', () => {
  let healthController: HealthController
  let metricsController: MetricsController
  let metricsService: MetricsService

  beforeEach(() => {
    healthController = new HealthController()
    metricsService = new MetricsService()
    metricsController = new MetricsController(metricsService)
  })

  it('GET /health returns realtime service status', () => {
    const res = healthController.check()
    expect(res.status).toBe('ok')
    expect(res.service).toBe('syncspace-realtime')
  })

  it('GET /health/live returns ok', () => {
    expect(healthController.live()).toEqual({ status: 'ok' })
  })

  it('GET /metrics returns prometheus metrics', async () => {
    const mockRes: any = { set: jest.fn(), end: jest.fn() }
    await metricsController.getMetrics(mockRes)
    expect(mockRes.set).toHaveBeenCalledWith('Content-Type', expect.stringContaining('text/plain'))
    expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('syncspace_realtime_'))
  })
})
