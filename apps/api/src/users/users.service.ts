import { Injectable, NotFoundException } from '@nestjs/common'
import { eq, sql } from 'drizzle-orm'
import type { SafeUser } from '@syncspace/contracts'
import { DatabaseService } from '../database/database.service'
import { users } from '../database/schema'

export interface UserCredentials {
  user: SafeUser
  passwordHash: string
}

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async findByEmail(email: string): Promise<SafeUser | null> {
    const [user] = await this.database.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
      .limit(1)

    return user ? this.toSafeUser(user) : null
  }

  async findCredentials(email: string): Promise<UserCredentials | null> {
    const [record] = await this.database.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
      .limit(1)

    if (!record) return null
    const { passwordHash, ...user } = record
    return { user: this.toSafeUser(user), passwordHash }
  }

  async findById(id: string): Promise<SafeUser> {
    const [user] = await this.database.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) throw new NotFoundException('User not found.')
    return this.toSafeUser(user)
  }

  async create(input: { name: string; email: string; passwordHash: string }): Promise<SafeUser> {
    const [user] = await this.database.db
      .insert(users)
      .values(input)
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })

    return this.toSafeUser(user)
  }

  private toSafeUser(user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
    createdAt: Date
    updatedAt: Date
  }): SafeUser {
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }
  }
}
