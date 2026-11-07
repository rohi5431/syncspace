import { AuthService } from '../src/auth/auth.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'

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
        update: jest.fn().mockResolvedValue({}),
      },
      workspace: {
        create: jest.fn(),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      adminAuditLog: {
        create: jest.fn().mockResolvedValue({}),
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

  it('returns the persisted user profile', async () => {
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

  it('authenticates the seeded workspace administrator with the demo password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'usr-maya',
      email: 'maya@northstar.co',
      name: 'Maya Chen',
      initials: 'MC',
      tone: 'indigo',
      role: 'ADMIN',
      platformRole: 'ADMIN',
      passwordHash: await bcrypt.hash('syncspace123', 10),
      isSuspended: false,
      memberships: [{
        role: 'ADMIN',
        workspace: { id: 'ws-northstar', name: 'Northstar Studio', slug: 'northstar-studio' },
      }],
    })

    const result = await authService.login({
      email: 'maya@northstar.co',
      password: 'syncspace123',
    })

    expect(result.user.role).toBe('ADMIN')
    expect(result.user.platformRole).toBe('ADMIN')
    expect(result.workspace?.slug).toBe('northstar-studio')
    expect(result.accessToken).toBeDefined()
  })

  it('does not issue a fake session when the database is unavailable', async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error('database unavailable'))

    await expect(authService.login({
      email: 'maya@northstar.co',
      password: 'syncspace123',
    })).rejects.toThrow('database unavailable')
  })

  it('rejects suspended accounts during login', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'usr-suspended',
      email: 'suspended@northstar.co',
      passwordHash: await bcrypt.hash('password123', 10),
      isSuspended: true,
    })

    await expect(authService.login({
      email: 'suspended@northstar.co',
      password: 'password123',
    })).rejects.toThrow('This account has been suspended.')
  })
})
