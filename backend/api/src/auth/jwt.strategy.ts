import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'syncspace-jwt-access-secret',
    })
  }

  async validate(payload: { sub: string; email: string; sid?: string }) {
    const [user, session] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          initials: true,
          tone: true,
          role: true,
          platformRole: true,
          isSuspended: true,
        },
      }),
      payload.sid
        ? this.prisma.refreshToken.findFirst({
            where: {
              id: payload.sid,
              userId: payload.sub,
              revoked: false,
              expiresAt: { gt: new Date() },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ])
    if (!user) throw new UnauthorizedException('User no longer exists')
    if (user.isSuspended) throw new UnauthorizedException('This account has been suspended.')
    if (!session) throw new UnauthorizedException('Session has been revoked')
    return { ...user, sessionId: session?.id }
  }
}
