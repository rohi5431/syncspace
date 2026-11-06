import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ThrottlerModule } from '@nestjs/throttler'
import type { JwtSignOptions } from '@nestjs/jwt'
import { UsersModule } from '../users/users.module'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PasswordService } from './password.service'
import { SessionService } from './session.service'

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<number>('JWT_ACCESS_EXPIRES_IN', 900) as JwtSignOptions['expiresIn'],
          issuer: 'syncspace-api',
          audience: 'syncspace-app',
        },
        verifyOptions: {
          issuer: 'syncspace-api',
          audience: 'syncspace-app',
        },
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    SessionService,
    JwtAuthGuard,
    { provide: APP_GUARD, useExisting: JwtAuthGuard },
  ],
  exports: [SessionService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
