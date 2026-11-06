import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'
import { ACCESS_COOKIE } from '../../auth/auth.cookies'
import { SessionService } from '../../auth/session.service'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import type { AuthenticatedUser } from '../types/authenticated-user'

interface AccessTokenPayload {
  sub: string
  sid: string
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<Request>()
    const accessToken = request.cookies?.[ACCESS_COOKIE]
    if (!accessToken) throw new UnauthorizedException('Authentication required.')

    let payload: AccessTokenPayload
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(accessToken)
    } catch {
      throw new UnauthorizedException('Authentication required.')
    }

    if (!payload.sub || !payload.sid || !(await this.sessions.isActive(payload.sid, payload.sub))) {
      throw new UnauthorizedException('Authentication required.')
    }

    request.user = { id: payload.sub, sessionId: payload.sid } satisfies AuthenticatedUser
    return true
  }
}
