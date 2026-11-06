import { HealthController } from '../src/health/health.controller'
import { MetricsController } from '../src/metrics/metrics.controller'
import { MetricsService } from '../src/metrics/metrics.service'

describe('Health and Metrics Controllers', () => {
  let healthController: HealthController
  let metricsController: MetricsController
  let metricsService: MetricsService
  let mockPrisma: any
  let mockRedis: any

  beforeEach(() => {
    mockPrisma = { isHealthy: jest.fn().mockReturnValue(true) }
    mockRedis = { isHealthy: jest.fn().mockReturnValue(true) }
    healthController = new HealthController(mockPrisma, mockRedis)
    metricsService = new MetricsService()
    metricsController = new MetricsController(metricsService)
  })

  it('GET /health returns status ok with timestamp and uptime', () => {
    const result = healthController.check()
    expect(result.status).toBe('ok')
    expect(result.service).toBe('syncspace-api')
    expect(typeof result.timestamp).toBe('string')
    expect(typeof result.uptime).toBe('number')
  })

  it('GET /health/live returns status ok', () => {
    const result = healthController.live()
    expect(result).toEqual({ status: 'ok' })
  })

  it('GET /health/ready checks database and redis', () => {
    const result = healthController.ready()
    expect(result.status).toBe('ok')
    expect(result.checks.database).toBe('up')
    expect(result.checks.redis).toBe('up')
  })

  it('GET /metrics returns prometheus metrics output', async () => {
    const mockRes: any = {
      set: jest.fn(),
      end: jest.fn(),
    }
    await metricsController.getMetrics(mockRes)
    expect(mockRes.set).toHaveBeenCalledWith('Content-Type', expect.stringContaining('text/plain'))
    expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('syncspace_api_'))
  })
})
