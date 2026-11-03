import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database, DbExecutor } from '../../database/database.types';
import { moderationEvents } from '../../database/schema';
import type {
  ModerationEvent,
  ModerationEventFilter,
  NewModerationEvent,
} from './moderation-events.types';

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
};

@Injectable()
export class ModerationEventsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async append(event: NewModerationEvent, executor: DbExecutor = this.db): Promise<void> {
    await executor.insert(moderationEvents).values(event);
  }

  list(filter: ModerationEventFilter): Promise<ModerationEvent[]> {
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

  async findById(id: string): Promise<ModerationEvent | null> {
    const [row] = await this.db
      .select(EVENT_COLUMNS)
      .from(moderationEvents)
      .where(eq(moderationEvents.id, id))
      .limit(1);
    return row ?? null;
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
}
