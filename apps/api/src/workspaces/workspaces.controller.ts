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
} from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ACCESS_COOKIE } from '../auth/auth.cookies'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { WorkspaceRoles } from '../common/decorators/workspace-roles.decorator'
import type { AuthenticatedUser } from '../common/types/authenticated-user'
import { WorkspaceRoleGuard } from '../common/guards/workspace-role.guard'
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto'
import { WorkspacesService } from './workspaces.service'
import { UseGuards } from '@nestjs/common'

@Controller('workspaces')
@ApiTags('Workspaces')
@ApiCookieAuth(ACCESS_COOKIE)
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Workspace created and creator added as OWNER.' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateWorkspaceDto) {
    return this.workspaces.create(user.id, body)
  }

  @Get()
  @ApiOkResponse({ description: 'Workspaces the authenticated user belongs to.' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.workspaces.list(user.id)
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Workspace details for a current member.' })
  @ApiNotFoundResponse({ description: 'Workspace does not exist or is not visible to this user.' })
  get(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.workspaces.get(id, user.id)
  }

  @Patch(':id')
  @WorkspaceRoles('OWNER', 'ADMIN')
  @UseGuards(WorkspaceRoleGuard)
  @ApiOkResponse({ description: 'Workspace updated.' })
  @ApiForbiddenResponse({ description: 'OWNER or ADMIN membership is required.' })
  @ApiNotFoundResponse({ description: 'Workspace does not exist or is not visible to this user.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateWorkspaceDto,
  ) {
    return this.workspaces.update(id, user.id, body)
  }

  @Delete(':id')
  @WorkspaceRoles('OWNER')
  @UseGuards(WorkspaceRoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Workspace and its memberships deleted.' })
  @ApiForbiddenResponse({ description: 'Only the OWNER can delete a workspace.' })
  @ApiNotFoundResponse({ description: 'Workspace does not exist or is not visible to this user.' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.workspaces.remove(id, user.id)
  }
}
