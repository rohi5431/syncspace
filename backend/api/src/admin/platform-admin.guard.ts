import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { AuthenticatedRequest } from '../auth/authenticated-request'

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    if (request.user.platformRole !== 'ADMIN') {
      throw new ForbiddenException('Platform administrator access is required')
    }
    return true
  }
}
