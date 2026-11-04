import { Logger, type Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';
import { REDIS } from './redis.tokens';

export const redisProvider: Provider = {
  provide: REDIS,
  inject: [AppConfigService],
  useFactory: (config: AppConfigService): Redis => {
    const logger = new Logger('Redis');
    const client = new Redis(config.get('REDIS_URL'), { maxRetriesPerRequest: 1 });
    client.on('error', (error: Error) => logger.warn(`Redis connection error: ${error.message}`));
    return client;
  },
};
