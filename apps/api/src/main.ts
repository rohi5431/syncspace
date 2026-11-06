import 'reflect-metadata'
import cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ApiExceptionFilter } from './common/filters/api-exception.filter'
import { ACCESS_COOKIE } from './auth/auth.cookies'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const frontendOrigin = new URL(config.getOrThrow<string>('FRONTEND_URL')).origin

  app.setGlobalPrefix('api')
  app.getHttpAdapter().getInstance().disable('x-powered-by')
  app.use(cookieParser())
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
  }))
  app.useGlobalFilters(new ApiExceptionFilter())

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SyncSpace API')
    .setDescription('Authentication and workspace management API.')
    .setVersion('1.0.0')
    .addCookieAuth(ACCESS_COOKIE, { type: 'apiKey', in: 'cookie' }, ACCESS_COOKIE)
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'api/docs-json' })

  await app.listen(config.get<number>('PORT', 4000), '0.0.0.0')
}

void bootstrap()
