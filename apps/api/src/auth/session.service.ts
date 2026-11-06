import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { authSessions } from '../database/schema'
import { DatabaseService } from '../database/database.service'

const DAY_IN_MS = 24 * 60 * 60 * 1000

function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

@Injectable()
export class SessionService {
  constructor(private readonly database: DatabaseService) {}

  async create(userId: string, remember = true) {
    const id = randomUUID()
    const refreshToken = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + (remember ? 30 : 1) * DAY_IN_MS)

    await this.database.db.insert(authSessions).values({
      id,
      userId,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt,
    })

    return { id, userId, refreshToken, expiresAt }
  }

  async rotate(refreshToken: string) {
    const nextRefreshToken = randomBytes(32).toString('base64url')
    const now = new Date()
    const [session] = await this.database.db
      .update(authSessions)
      .set({ refreshTokenHash: hashRefreshToken(nextRefreshToken) })
      .where(and(
        eq(authSessions.refreshTokenHash, hashRefreshToken(refreshToken)),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, now),
      ))
      .returning({ id: authSessions.id, userId: authSessions.userId, expiresAt: authSessions.expiresAt })

    return session ? { ...session, refreshToken: nextRefreshToken } : null
  }

  async isActive(sessionId: string, userId: string) {
    const [session] = await this.database.db
      .select({ id: authSessions.id })
      .from(authSessions)
      .where(and(
        eq(authSessions.id, sessionId),
        eq(authSessions.userId, userId),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ))
      .limit(1)

    return Boolean(session)
  }

  async revokeByRefreshToken(refreshToken?: string) {
    if (!refreshToken) return

    await this.database.db
      .update(authSessions)
      .set({ revokedAt: new Date() })
      .where(and(
        eq(authSessions.refreshTokenHash, hashRefreshToken(refreshToken)),
        isNull(authSessions.revokedAt),
      ))
  }

  async revokeById(sessionId: string) {
    await this.database.db
      .update(authSessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(authSessions.id, sessionId), isNull(authSessions.revokedAt)))
  }
}
