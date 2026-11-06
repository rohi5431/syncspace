import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { SafeUser } from '@syncspace/contracts'
import { PasswordService } from './password.service'
import { SessionService } from './session.service'
import { UsersService } from '../users/users.service'

interface TokenBundle {
  user: SafeUser
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: Date
  accessTokenExpiresIn: number
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505'
}

@Injectable()
export class AuthService {
  private readonly accessTokenExpiresIn: number

  constructor(
    private readonly users: UsersService,
    private readonly sessions: SessionService,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.accessTokenExpiresIn = config.get<number>('JWT_ACCESS_EXPIRES_IN', 900)
  }

  async register(input: { name: string; email: string; password: string }): Promise<TokenBundle> {
    const email = this.normalizeEmail(input.email)
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('An account with this email already exists.')
    }

    const passwordHash = await this.passwords.hash(input.password)
    let user: SafeUser
    try {
      user = await this.users.create({ name: input.name.trim(), email, passwordHash })
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('An account with this email already exists.')
      }
      throw error
    }

    return this.issueTokens(user, true)
  }

  async login(input: { email: string; password: string; remember?: boolean }): Promise<TokenBundle> {
    const credentials = await this.users.findCredentials(this.normalizeEmail(input.email))
    const passwordMatches = await this.passwords.verify(input.password, credentials?.passwordHash)
    if (!credentials || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.')
    }

    return this.issueTokens(credentials.user, input.remember ?? true)
  }

  async refresh(refreshToken?: string): Promise<TokenBundle> {
    if (!refreshToken) throw new UnauthorizedException('Authentication required.')

    const session = await this.sessions.rotate(refreshToken)
    if (!session) throw new UnauthorizedException('Authentication required.')

    const user = await this.users.findById(session.userId)
    if (!user) {
      await this.sessions.revokeById(session.id)
      throw new UnauthorizedException('Authentication required.')
    }

    const accessToken = await this.jwt.signAsync({ sub: user.id, sid: session.id })
    return {
      user,
      accessToken,
      refreshToken: session.refreshToken,
      refreshTokenExpiresAt: session.expiresAt,
      accessTokenExpiresIn: this.accessTokenExpiresIn,
    }
  }

  async logout(refreshToken?: string) {
    await this.sessions.revokeByRefreshToken(refreshToken)
  }

  private async issueTokens(user: SafeUser, remember: boolean): Promise<TokenBundle> {
    const session = await this.sessions.create(user.id, remember)
    const accessToken = await this.jwt.signAsync({ sub: user.id, sid: session.id })

    return {
      user,
      accessToken,
      refreshToken: session.refreshToken,
      refreshTokenExpiresAt: session.expiresAt,
      accessTokenExpiresIn: this.accessTokenExpiresIn,
    }
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase()
  }
}
