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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ACCESS_COOKIE } from '../auth/auth.cookies'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '../common/types/authenticated-user'
import { CreateFolderDto, UpdateFolderDto } from './folders.dto'
import { FoldersService } from './folders.service'

@Controller()
@ApiTags('Folders')
@ApiCookieAuth(ACCESS_COOKIE)
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
export class FoldersController {
  constructor(private readonly folders: FoldersService) {}

  @Post('workspaces/:workspaceId/folders')
  @ApiCreatedResponse({ description: 'Folder created in the workspace.' })
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateFolderDto,
  ) {
    return this.folders.create(workspaceId, user.id, body)
  }

  @Get('workspaces/:workspaceId/folders')
  @ApiOkResponse({ description: 'Workspace folders as a flat list with parent references.' })
  list(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.folders.list(workspaceId, user.id)
  }

  @Patch('folders/:folderId')
  @ApiOkResponse({ description: 'Folder renamed or moved.' })
  update(
    @Param('folderId', ParseUUIDPipe) folderId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateFolderDto,
  ) {
    return this.folders.update(folderId, user.id, body)
  }

  @Delete('folders/:folderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Folder removed; documents and child folders are reparented safely.' })
  async remove(@Param('folderId', ParseUUIDPipe) folderId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.folders.remove(folderId, user.id)
  }
}
