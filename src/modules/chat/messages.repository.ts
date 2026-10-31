import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, ne, or, sql, type SQL } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';
import { messages } from '../../database/schema';
import type { Message, MessagePageQuery, NewMessage } from './messages.types';
import { ModerationEventsRepository } from '../moderation-events/moderation-events.repository';
import { NewModerationEvent } from '../moderation-events/moderation-events.types';

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

  //Mesajı kaydeder, ama aynı mesajı iki kez kaydetmez
  async insertOnce(
    newMessage: NewMessage,
    toViolationEvent?: (saved: Message) => NewModerationEvent,
  ): Promise<Message> {
    return this.db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(messages)
        .values(newMessage)
        .onConflictDoNothing({ target: [messages.senderId, messages.clientMessageId] })
        .returning(MESSAGE_COLUMNS);
      if (inserted) {
        if (toViolationEvent) {
          await this.moderationEventsRepository.append(toViolationEvent(inserted), tx);
        }
        return inserted;
      }
      const [existing] = await tx
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
    });
  }

  //Bir odanın mesajlarını en yeniden eskiye doğru getirir.
  listPage(query: MessagePageQuery): Promise<Message[]> {
    const conditions: (SQL | undefined)[] = [eq(messages.roomId, query.roomId)];
    if (!query.includeBlocked) {
      conditions.push(or(ne(messages.status, 'BLOCKED'), eq(messages.senderId, query.viewerId)));
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
