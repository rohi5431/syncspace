import { Controller, Get } from '@nestjs/common'
import { ApiCookieAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { ACCESS_COOKIE } from '../auth/auth.cookies'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '../common/types/authenticated-user'
import { UsersService } from './users.service'

@Controller('users')
@ApiTags('Users')
@ApiCookieAuth(ACCESS_COOKIE)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOkResponse({ description: 'Returns the authenticated user profile.' })
  @ApiUnauthorizedResponse({ description: 'Authentication required.' })
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.users.findById(currentUser.id)
  }
}
