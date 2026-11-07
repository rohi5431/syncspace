import { createHash, randomUUID } from 'node:crypto'
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim()
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new BadRequestException('An account with this email already exists.')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const initials = getInitials(dto.fullName)
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: dto.fullName.trim(),
        initials,
        tone: 'indigo',
        role: 'OWNER',
      },
    })

    const slug = `${dto.fullName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-workspace-${Date.now().toString(36)}`
    const workspace = await this.prisma.workspace.create({
      data: {
        name: `${dto.fullName.trim()}'s Workspace`,
        slug,
        ownerId: user.id,
        members: { create: { userId: user.id, role: 'OWNER' } },
      },
    })

    const tokens = await this.createSession(user.id, user.email, [
      { id: workspace.id, role: 'OWNER' },
    ])
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        initials: user.initials,
        tone: user.tone,
        role: user.role,
        platformRole: user.platformRole,
      },
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
      ...tokens,
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim()
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: { workspace: true },
        },
      },
    })
    if (!user) throw new UnauthorizedException('Invalid email or password.')
    if (user.isSuspended) throw new UnauthorizedException('This account has been suspended.')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid email or password.')

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    const tokens = await this.createSession(
      user.id,
      user.email,
      user.memberships.map((membership) => ({
        id: membership.workspace.id,
        role: membership.role,
      })),
    )
    await this.prisma.adminAuditLog.create({
      data: {
        id: randomUUID(),
        actorId: user.id,
        actorEmail: user.email,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: user.id,
        success: true,
        metadata: { platformAdmin: user.platformRole === 'ADMIN' },
      },
    })
    const primaryWorkspace = user.memberships[0]?.workspace
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        initials: user.initials,
        tone: user.tone,
        role: user.role,
        platformRole: user.platformRole,
      },
      workspace: primaryWorkspace
        ? { id: primaryWorkspace.id, name: primaryWorkspace.name, slug: primaryWorkspace.slug }
        : null,
      ...tokens,
    }
  }

  async refresh(dto: RefreshDto) {
    let payload: { sub: string; email: string; sid: string }
    try {
      payload = this.jwtService.verify<{ sub: string; email: string; sid: string }>(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'syncspace-jwt-refresh-secret',
      })
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
    if (!payload.sid) throw new UnauthorizedException('Invalid or expired refresh token')
    const tokenHash = this.hashToken(dto.refreshToken)
    const session = await this.prisma.refreshToken.findUnique({
      where: { id: payload.sid },
      select: { id: true, userId: true, tokenHash: true, expiresAt: true, revoked: true },
    })
    if (
      !session ||
      session.userId !== payload.sub ||
      session.tokenHash !== tokenHash ||
      session.revoked ||
      session.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId: payload.sub },
      select: { workspaceId: true, role: true },
    })
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { isSuspended: true },
    })
    if (!user || user.isSuspended) throw new UnauthorizedException('Invalid or expired refresh token')
    const workspaces = memberships.map((membership) => ({
      id: membership.workspaceId,
      role: membership.role,
    }))
    const tokens = this.signSessionTokens(payload.sub, payload.email, workspaces, payload.sid)
    const updated = await this.prisma.refreshToken.updateMany({
      where: { id: payload.sid, tokenHash, revoked: false, expiresAt: { gt: new Date() } },
      data: {
        tokenHash: this.hashToken(tokens.refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    if (updated.count !== 1) throw new UnauthorizedException('Invalid or expired refresh token')
    return tokens
  }

  async logout(userId: string, sessionId?: string) {
    if (sessionId) {
      await this.prisma.refreshToken.updateMany({
        where: { id: sessionId, userId, revoked: false },
        data: { revoked: true },
      })
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })
    await this.prisma.adminAuditLog.create({
      data: {
        id: randomUUID(),
        actorId: userId,
        actorEmail: user?.email,
        action: 'USER_LOGOUT',
        resourceType: 'user',
        resourceId: userId,
        success: true,
      },
    })
    return { success: true, message: 'Logged out successfully.' }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        initials: true,
        tone: true,
        role: true,
        platformRole: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  private async createSession(
    userId: string,
    email: string,
    workspaces: Array<{ id: string; role: string }> = [],
  ) {
    const sessionId = randomUUID()
    const tokens = this.signSessionTokens(userId, email, workspaces, sessionId)
    await this.prisma.refreshToken.create({
      data: {
        id: sessionId,
        userId,
        tokenHash: this.hashToken(tokens.refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    return tokens
  }

  private signSessionTokens(
    userId: string,
    email: string,
    workspaces: Array<{ id: string; role: string }>,
    sessionId: string,
  ) {
    const payload = { sub: userId, email, workspaces, sid: sessionId }
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'syncspace-jwt-access-secret',
      expiresIn: '15m',
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'syncspace-jwt-refresh-secret',
      expiresIn: '7d',
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    }
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
  }
}
