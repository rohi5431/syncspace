import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

@Injectable()
export class RequestOriginGuard implements CanActivate {
  private readonly frontendOrigin: string

  constructor(config: ConfigService) {
    this.frontendOrigin = new URL(config.getOrThrow<string>('FRONTEND_URL')).origin
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>()
    if (!STATE_CHANGING_METHODS.has(request.method.toUpperCase())) return true

    const fetchSite = request.get('sec-fetch-site')
    if (fetchSite === 'cross-site') {
      throw new ForbiddenException('Cross-site requests are not allowed.')
    }

    const origin = request.get('origin')
    if (!origin || fetchSite === 'same-origin' || origin === this.frontendOrigin) return true

    throw new ForbiddenException('Request origin is not allowed.')
  }
}
