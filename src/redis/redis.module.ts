import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import type Redis from 'ioredis';
import { RateLimiterService } from './rate-limiter.service';
import { redisProvider } from './redis.provider';
import { REDIS } from './redis.tokens';
import { PresenceService } from './presence.service';

@Global()
@Module({
  providers: [redisProvider, RateLimiterService, PresenceService],
  exports: [REDIS, RateLimiterService, PresenceService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}
