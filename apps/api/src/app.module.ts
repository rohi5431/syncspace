import { resolve } from 'node:path'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import Joi from 'joi'
import { AuthModule } from './auth/auth.module'
import { RequestOriginGuard } from './common/guards/request-origin.guard'
import { DatabaseModule } from './database/database.module'
import { UsersModule } from './users/users.module'
import { WorkspacesModule } from './workspaces/workspaces.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '../../.env.development.local'),
        resolve(process.cwd(), '.env.development.local'),
        resolve(process.cwd(), '.env'),
      ],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string()
          .uri({ scheme: ['postgres', 'postgresql'] })
          .required(),
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        JWT_ACCESS_EXPIRES_IN: Joi.number().integer().min(60).max(3600).default(900),
        FRONTEND_URL: Joi.string().uri({ scheme: ['http', 'https'] }).default('http://localhost:3000'),
        PORT: Joi.number().port().default(4000),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
      }).unknown(true),
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    WorkspacesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: RequestOriginGuard }],
})
export class AppModule {}
