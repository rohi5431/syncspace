import { AuthService } from '../src/auth/auth.service'
import { JwtService } from '@nestjs/jwt'

describe('AuthService', () => {
  let authService: AuthService
  let mockPrisma: any
  let jwtService: JwtService

  beforeEach(() => {
    jwtService = new JwtService()
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      workspace: {
        create: jest.fn(),
      },
    }
    authService = new AuthService(mockPrisma as any, jwtService)
  })

  it('registers a new user and issues tokens', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({
      id: 'usr-1',
      email: 'alex@northstar.co',
      name: 'Alex Johnson',
      initials: 'AJ',
      tone: 'indigo',
      role: 'OWNER',
    })
    mockPrisma.workspace.create.mockResolvedValue({
      id: 'ws-1',
      name: "Alex Johnson's Workspace",
      slug: 'alex-johnson-workspace',
    })

    const result = await authService.register({
      fullName: 'Alex Johnson',
      email: 'alex@northstar.co',
      password: 'password123',
    })

    expect(result.user.email).toBe('alex@northstar.co')
    expect(result.user.initials).toBe('AJ')
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
  })

  it('provides profile fallback for testing', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'usr-1',
      email: 'alex@northstar.co',
      name: 'Alex Johnson',
      initials: 'AJ',
      tone: 'indigo',
      role: 'OWNER',
      createdAt: new Date(),
    })
    const profile = await authService.getProfile('usr-1')
    expect(profile).toBeDefined()
    expect(profile?.email).toBe('alex@northstar.co')
  })
})
