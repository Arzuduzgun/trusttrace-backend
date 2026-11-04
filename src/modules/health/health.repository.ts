import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';
import Redis from 'ioredis/built/Redis';
import { REDIS } from '../../redis/redis.tokens';

@Injectable()
export class HealthRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async pingDatabase(): Promise<boolean> {
    await this.db.execute(sql`select 1`);
    return true;
  }

  async pingRedis(): Promise<void> {
    await this.redis.ping();
  }
}
