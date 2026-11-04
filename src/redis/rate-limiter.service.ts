import { Inject, Injectable, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS } from './redis.tokens';
import type { RateLimitResult } from './types/rate-limit.types';

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    try {
      const results = await this.redis
        .multi()
        .incr(key)
        .expire(key, windowSeconds, 'NX')
        .ttl(key)
        .exec();
      const count = Number(results?.[0]?.[1] ?? 0);
      const ttl = Number(results?.[2]?.[1] ?? windowSeconds);
      return { allowed: count <= limit, retryAfterSeconds: Math.max(ttl, 1) };
    } catch (error) {
      this.logger.warn(`Rate limiter unavailable, allowing request: ${String(error)}`);
      return { allowed: true, retryAfterSeconds: 0 };
    }
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key).catch(() => undefined);
  }
}
