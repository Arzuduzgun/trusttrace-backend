import type { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { AppConfigService } from '../config/app-config.service';
import { DRIZZLE } from './database.tokens';
import * as schema from './schema';

export const databaseProvider: Provider = {
  provide: DRIZZLE,
  inject: [AppConfigService],
  useFactory: (config: AppConfigService) => {
    const pool = new Pool({ connectionString: config.get('DATABASE_URL'), max: 10 });
    return drizzle(pool, { schema });
  },
};
