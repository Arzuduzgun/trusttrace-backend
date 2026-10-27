import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';

@Injectable()
export class HealthRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async pingDatabase(): Promise<boolean> {
    await this.db.execute(sql`select 1`);
    return true;
  }
}