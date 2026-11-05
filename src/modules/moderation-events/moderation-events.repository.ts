import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, sql, asc, gt } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database, DbExecutor } from '../../database/database.types';
import { moderationEvents } from '../../database/schema';
import type {
  ChainedModerationEvent,
  ModerationEvent,
  ModerationEventFilter,
  NewModerationEvent,
} from './types/moderation-events.types';
import { GENESIS_HASH, hashEvent } from './ledger-hash';
import { randomUUID } from 'crypto';

const EVENT_COLUMNS = {
  seq: moderationEvents.seq,
  id: moderationEvents.id,
  eventType: moderationEvents.eventType,
  actorType: moderationEvents.actorType,
  actorId: moderationEvents.actorId,
  subjectUserId: moderationEvents.subjectUserId,
  roomId: moderationEvents.roomId,
  messageId: moderationEvents.messageId,
  refersToEventId: moderationEvents.refersToEventId,
  payload: moderationEvents.payload,
  traceId: moderationEvents.traceId,
  occurredAt: moderationEvents.occurredAt,
  prevHash: moderationEvents.prevHash,
  hash: moderationEvents.hash,
};

@Injectable()
export class ModerationEventsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async append(event: NewModerationEvent, executor: DbExecutor = this.db): Promise<void> {
    if (executor === this.db) {
      await this.db.transaction((tx) => this.appendChained(event, tx));
      return;
    }
    await this.appendChained(event, executor);
  }

  private async appendChained(event: NewModerationEvent, tx: DbExecutor): Promise<void> {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('moderation-events-chain'))`);
    const [last] = await tx
      .select({ hash: moderationEvents.hash })
      .from(moderationEvents)
      .orderBy(desc(moderationEvents.seq))
      .limit(1);
    const prevHash = last?.hash ?? GENESIS_HASH;
    const record = { ...event, id: randomUUID(), occurredAt: new Date() };
    await tx
      .insert(moderationEvents)
      .values({ ...record, prevHash, hash: hashEvent(record, prevHash) });
  }

  list(filter: ModerationEventFilter): Promise<ChainedModerationEvent[]> {
    return this.db
      .select(EVENT_COLUMNS)
      .from(moderationEvents)
      .where(
        and(
          filter.eventType ? eq(moderationEvents.eventType, filter.eventType) : undefined,
          filter.userId ? eq(moderationEvents.subjectUserId, filter.userId) : undefined,
          filter.roomId ? eq(moderationEvents.roomId, filter.roomId) : undefined,
        ),
      )
      .orderBy(desc(moderationEvents.seq))
      .limit(filter.limit);
  }

  async hasRevocation(eventId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ seq: moderationEvents.seq })
      .from(moderationEvents)
      .where(
        and(
          eq(moderationEvents.refersToEventId, eventId),
          eq(moderationEvents.eventType, 'SANCTION_REVOKED'),
        ),
      )
      .limit(1);
    return row !== undefined;
  }

  async findLatestSanction(userId: string): Promise<ModerationEvent | null> {
    const [row] = await this.db
      .select(EVENT_COLUMNS)
      .from(moderationEvents)
      .where(
        and(
          eq(moderationEvents.subjectUserId, userId),
          eq(moderationEvents.eventType, 'SANCTION_IMPOSED'),
        ),
      )
      .orderBy(desc(moderationEvents.seq))
      .limit(1);
    return row ?? null;
  }

  listChainPage(afterSeq: number, limit: number): Promise<ChainedModerationEvent[]> {
    return this.db
      .select(EVENT_COLUMNS)
      .from(moderationEvents)
      .where(gt(moderationEvents.seq, afterSeq))
      .orderBy(asc(moderationEvents.seq))
      .limit(limit);
  }
}
