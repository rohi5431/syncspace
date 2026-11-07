import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { AuthenticatedRequest } from './authenticated-request'

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.id, req.user.sessionId)
  }
}
