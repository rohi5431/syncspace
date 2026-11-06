import { jest } from '@jest/globals'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import type { SafeUser } from '@syncspace/contracts'
import { AuthService } from './auth.service'

const user: SafeUser = {
  id: '4c4d4c82-9845-4895-a2ee-710b8c138f08',
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  avatarUrl: null,
  createdAt: '2026-11-06T00:00:00.000Z',
  updatedAt: '2026-11-06T00:00:00.000Z',
}

describe('AuthService', () => {
  const users = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findCredentials: jest.fn(),
    findById: jest.fn(),
  }
  const sessions = {
    create: jest.fn(),
    rotate: jest.fn(),
    revokeByRefreshToken: jest.fn(),
    revokeById: jest.fn(),
  }
  const passwords = { hash: jest.fn(), verify: jest.fn() }
  const jwt = { signAsync: jest.fn() }
  let service: AuthService

  beforeEach(() => {
    jest.clearAllMocks()
    users.findByEmail.mockResolvedValue(null)
    users.create.mockResolvedValue(user)
    users.findCredentials.mockResolvedValue({ user, passwordHash: 'bcrypt-hash' })
    users.findById.mockResolvedValue(user)
    passwords.hash.mockResolvedValue('bcrypt-hash')
    passwords.verify.mockResolvedValue(true)
    sessions.create.mockResolvedValue({
      id: 'session-id',
      userId: user.id,
      refreshToken: 'refresh-secret',
      expiresAt: new Date('2026-12-06T00:00:00.000Z'),
    })
    sessions.rotate.mockResolvedValue({
      id: 'session-id',
      userId: user.id,
      refreshToken: 'rotated-refresh-secret',
      expiresAt: new Date('2026-12-06T00:00:00.000Z'),
    })
    jwt.signAsync.mockResolvedValue('signed-access-token')
    service = new AuthService(
      users as never,
      sessions as never,
      passwords as never,
      jwt as never,
      { get: () => 900 } as never,
    )
  })

  it('registers a user with a bcrypt hash and returns no password fields', async () => {
    const result = await service.register({
      name: ' Jordan Lee ',
      email: 'Jordan@Example.com',
      password: 'correct-horse-123',
    })

    expect(users.create).toHaveBeenCalledWith({
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      passwordHash: 'bcrypt-hash',
    })
    expect(sessions.create).toHaveBeenCalledWith(user.id, true)
    expect(result).toMatchObject({ user, accessToken: 'signed-access-token' })
    expect(result).not.toHaveProperty('passwordHash')
  })

  it('rejects duplicate email addresses', async () => {
    users.findByEmail.mockResolvedValue(user)

    await expect(service.register({
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      password: 'correct-horse-123',
    })).rejects.toBeInstanceOf(ConflictException)
    expect(users.create).not.toHaveBeenCalled()
  })

  it('converts a database uniqueness race into a conflict response', async () => {
    users.create.mockRejectedValue({ code: '23505' })

    await expect(service.register({
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      password: 'correct-horse-123',
    })).rejects.toBeInstanceOf(ConflictException)
  })

  it('creates a session after a successful login', async () => {
    const result = await service.login({ email: 'JORDAN@example.com', password: 'correct-horse-123' })

    expect(passwords.verify).toHaveBeenCalledWith('correct-horse-123', 'bcrypt-hash')
    expect(sessions.create).toHaveBeenCalledWith(user.id, true)
    expect(result.user).toEqual(user)
  })

  it('returns a generic error for an invalid login', async () => {
    users.findCredentials.mockResolvedValue(null)
    passwords.verify.mockResolvedValue(false)

    await expect(service.login({ email: 'missing@example.com', password: 'wrong-password' }))
      .rejects.toBeInstanceOf(UnauthorizedException)
    expect(sessions.create).not.toHaveBeenCalled()
  })
})
