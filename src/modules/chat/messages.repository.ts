import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, or, sql, type SQL } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';
import { messages } from '../../database/schema';
import type { Message, MessagePageQuery, MessageStatus, NewMessage } from './types/messages.types';
import { ModerationEventsRepository } from '../moderation-events/moderation-events.repository';
import { NewModerationEvent } from '../moderation-events/types/moderation-events.types';

const OPEN_STATUSES: MessageStatus[] = ['PENDING', 'FAILED'];

const MESSAGE_COLUMNS = {
  id: messages.id,
  roomId: messages.roomId,
  senderId: messages.senderId,
  body: messages.body,
  clientMessageId: messages.clientMessageId,
  status: messages.status,
  createdAt: messages.createdAt,
};

@Injectable()
export class MessagesRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly moderationEventsRepository: ModerationEventsRepository,
  ) {}

  async insertOnce(newMessage: NewMessage): Promise<Message> {
    const [inserted] = await this.db
      .insert(messages)
      .values(newMessage)
      .onConflictDoNothing({ target: [messages.senderId, messages.clientMessageId] })
      .returning(MESSAGE_COLUMNS);
    if (inserted) {
      return inserted;
    }
    const [existing] = await this.db
      .select(MESSAGE_COLUMNS)
      .from(messages)
      .where(
        and(
          eq(messages.senderId, newMessage.senderId),
          eq(messages.clientMessageId, newMessage.clientMessageId),
        ),
      )
      .limit(1);
    if (!existing) {
      throw new Error('Message conflict without an existing row');
    }
    return existing;
  }

  async finalize(
    messageId: string,
    status: MessageStatus,
    toViolationEvent?: (saved: Message) => NewModerationEvent,
  ): Promise<Message> {
    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(messages)
        .set({ status })
        .where(and(eq(messages.id, messageId), inArray(messages.status, OPEN_STATUSES)))
        .returning(MESSAGE_COLUMNS);
      if (updated) {
        if (toViolationEvent) {
          await this.moderationEventsRepository.append(toViolationEvent(updated), tx);
        }
        return updated;
      }
      const [current] = await tx
        .select(MESSAGE_COLUMNS)
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);
      if (!current) {
        throw new Error('Message disappeared during finalize');
      }
      return current;
    });
  }

  async markFailed(messageId: string): Promise<void> {
    await this.db
      .update(messages)
      .set({ status: 'FAILED' })
      .where(and(eq(messages.id, messageId), eq(messages.status, 'PENDING')));
  }

  //Bir odanın mesajlarını en yeniden eskiye doğru getirir.
  listPage(query: MessagePageQuery): Promise<Message[]> {
    const conditions: (SQL | undefined)[] = [eq(messages.roomId, query.roomId)];
    if (!query.includeBlocked) {
      conditions.push(
        or(
          inArray(messages.status, ['DELIVERED', 'FLAGGED']),
          eq(messages.senderId, query.viewerId),
        ),
      );
    }
    if (query.before) {
      conditions.push(
        sql`(${messages.createdAt}, ${messages.id}) < (${query.before.createdAt.toISOString()}::timestamptz, ${query.before.id}::uuid)`,
      );
    }
    return this.db
      .select(MESSAGE_COLUMNS)
      .from(messages)
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(query.limit);
  }
}
