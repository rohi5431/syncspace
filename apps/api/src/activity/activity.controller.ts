import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiCookieAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { ACCESS_COOKIE } from '../auth/auth.cookies'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '../common/types/authenticated-user'
import { ActivityQueryDto } from './activity.dto'
import { ActivityService } from './activity.service'

@Controller('workspaces/:workspaceId/activity')
@ApiTags('Workspace activity')
@ApiCookieAuth(ACCESS_COOKIE)
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated recent activity visible to the authenticated workspace member.' })
  list(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ActivityQueryDto,
  ) {
    return this.activity.list(workspaceId, user.id, query)
  }
}
