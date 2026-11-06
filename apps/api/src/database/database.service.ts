import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly pool: Pool
  readonly db: NodePgDatabase<typeof schema>

  constructor(config: ConfigService) {
    this.pool = new Pool({
      connectionString: config.getOrThrow<string>('DATABASE_URL'),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
    this.db = drizzle(this.pool, { schema })
  }

  async onModuleDestroy() {
    await this.pool.end()
  }
}
