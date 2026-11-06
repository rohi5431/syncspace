import { jest } from '@jest/globals'
import cookieParser from 'cookie-parser'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { AuthenticatedUser } from '../common/types/authenticated-user'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { SessionService } from './session.service'
import { ACCESS_COOKIE } from './auth.cookies'

@Controller('protected-test')
@UseGuards(JwtAuthGuard)
class ProtectedTestController {
  @Get()
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return { userId: user.id }
  }
}

describe('protected API route', () => {
  let app: INestApplication
  const jwt = { verifyAsync: jest.fn() }
  const sessions = { isActive: jest.fn() }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProtectedTestController],
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: jwt },
        { provide: SessionService, useValue: sessions },
      ],
    }).compile()

    app = module.createNestApplication()
    app.use(cookieParser())
    await app.init()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jwt.verifyAsync.mockResolvedValue({ sub: 'user-id', sid: 'session-id' })
    sessions.isActive.mockResolvedValue(true)
  })

  afterAll(async () => {
    await app.close()
  })

  it('rejects requests without an access cookie', async () => {
    const response = await fetchRequest().get('/protected-test').expect(401)
    expect(response.body.message).toBe('Authentication required.')
    expect(jwt.verifyAsync).not.toHaveBeenCalled()
  })

  it('accepts a valid JWT only when its server-side session is active', async () => {
    const response = await fetchRequest()
      .get('/protected-test')
      .set('Cookie', `${ACCESS_COOKIE}=signed-token`)
      .expect(200)

    expect(response.body).toEqual({ userId: 'user-id' })
    expect(sessions.isActive).toHaveBeenCalledWith('session-id', 'user-id')
  })

  it('rejects a valid JWT when the session has been revoked', async () => {
    sessions.isActive.mockResolvedValue(false)

    await fetchRequest()
      .get('/protected-test')
      .set('Cookie', `${ACCESS_COOKIE}=signed-token`)
      .expect(401)
  })

  function fetchRequest() {
    return request(app.getHttpServer())
  }
})
