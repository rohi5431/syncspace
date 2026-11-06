import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import { UseGuards } from '@nestjs/common'
import type { AuthSessionResponse } from '@syncspace/contracts'
import type { Request, Response } from 'express'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import type { AuthenticatedUser } from '../common/types/authenticated-user'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'
import { ACCESS_COOKIE, REFRESH_COOKIE } from './auth.cookies'
import { LoginDto, RegisterDto } from './dto/auth.dto'

const TOO_MANY_AUTH_REQUESTS = { default: { limit: 5, ttl: 60_000 } }

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle(TOO_MANY_AUTH_REQUESTS)
  @ApiCreatedResponse({ description: 'Account created and secure session cookies issued.' })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    const result = await this.auth.register(body)
    this.writeCookies(response, result)
    return { user: result.user, accessTokenExpiresIn: result.accessTokenExpiresIn }
  }

  @Post('login')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle(TOO_MANY_AUTH_REQUESTS)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Signed in and secure session cookies issued.' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    const result = await this.auth.login(body)
    this.writeCookies(response, result)
    return { user: result.user, accessTokenExpiresIn: result.accessTokenExpiresIn }
  }

  @Post('refresh')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle(TOO_MANY_AUTH_REQUESTS)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Refresh token rotated and access cookie renewed.' })
  @ApiUnauthorizedResponse({ description: 'Refresh session is missing, expired, or revoked.' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    const result = await this.auth.refresh(request.cookies?.[REFRESH_COOKIE])
    this.writeCookies(response, result)
    return { user: result.user, accessTokenExpiresIn: result.accessTokenExpiresIn }
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Refresh session revoked and cookies cleared.' })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(request.cookies?.[REFRESH_COOKIE])
    const options = this.cookieOptions()
    response.clearCookie(ACCESS_COOKIE, options)
    response.clearCookie(REFRESH_COOKIE, options)
  }

  @Get('me')
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOkResponse({ description: 'Returns the authenticated profile.' })
  @ApiUnauthorizedResponse({ description: 'Authentication required.' })
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.users.findById(user.id)
  }

  private writeCookies(response: Response, result: {
    accessToken: string
    refreshToken: string
    refreshTokenExpiresAt: Date
    accessTokenExpiresIn: number
  }) {
    const options = this.cookieOptions()
    response.cookie(ACCESS_COOKIE, result.accessToken, {
      ...options,
      maxAge: result.accessTokenExpiresIn * 1000,
    })
    response.cookie(REFRESH_COOKIE, result.refreshToken, {
      ...options,
      expires: result.refreshTokenExpiresAt,
    })
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: true,
      sameSite: this.config.get<string>('NODE_ENV') === 'development' ? 'none' as const : 'lax' as const,
      path: '/',
    }
  }
}
