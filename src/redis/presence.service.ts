import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS } from './redis.tokens';

const PRESENCE_TTL_SECONDS = 60;

function keyOf(userId: string): string {
  return `presence:user:${userId}`;
}

@Injectable()
export class PresenceService {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async connect(userId: string, socketId: string): Promise<void> {
    await this.redis
      .multi()
      .sadd(keyOf(userId), socketId)
      .expire(keyOf(userId), PRESENCE_TTL_SECONDS)
      .exec();
  }

  async disconnect(userId: string, socketId: string): Promise<void> {
    await this.redis.srem(keyOf(userId), socketId);
  }

  async refresh(userIds: string[]): Promise<void> {
    if (userIds.length === 0) {
      return;
    }
    const pipeline = this.redis.pipeline();
    for (const userId of new Set(userIds)) {
      pipeline.expire(keyOf(userId), PRESENCE_TTL_SECONDS);
    }
    await pipeline.exec();
  }

  async onlineAmong(userIds: string[]): Promise<Set<string>> {
    if (userIds.length === 0) {
      return new Set();
    }
    const pipeline = this.redis.pipeline();
    for (const userId of userIds) {
      pipeline.exists(keyOf(userId));
    }
    const results = await pipeline.exec();
    return new Set(userIds.filter((_, index) => Number(results?.[index]?.[1] ?? 0) > 0));
  }
}
