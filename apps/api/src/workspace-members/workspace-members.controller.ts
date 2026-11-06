import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ACCESS_COOKIE } from '../auth/auth.cookies'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '../common/types/authenticated-user'
import { AddWorkspaceMemberDto, UpdateWorkspaceMemberDto, WorkspaceMembersQueryDto } from './workspace-members.dto'
import { WorkspaceMembersService } from './workspace-members.service'

@Controller()
@ApiTags('Workspace members')
@ApiCookieAuth(ACCESS_COOKIE)
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
export class WorkspaceMembersController {
  constructor(private readonly members: WorkspaceMembersService) {}

  @Get('workspaces/:workspaceId/members')
  @ApiOkResponse({ description: 'Paginated members of a workspace the caller belongs to.' })
  list(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: WorkspaceMembersQueryDto,
  ) {
    return this.members.list(workspaceId, user.id, query)
  }

  @Post('workspaces/:workspaceId/members')
  @ApiCreatedResponse({ description: 'Existing account added to the workspace as MEMBER.' })
  add(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AddWorkspaceMemberDto,
  ) {
    return this.members.add(workspaceId, user.id, body)
  }

  @Patch('workspaces/:workspaceId/members/:memberId')
  @ApiOkResponse({ description: 'Workspace member role changed.' })
  updateRole(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateWorkspaceMemberDto,
  ) {
    return this.members.updateRole(workspaceId, memberId, user.id, body)
  }

  @Delete('workspaces/:workspaceId/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Member removed or self-membership left.' })
  async remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.members.remove(workspaceId, memberId, user.id)
  }
}
