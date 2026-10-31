import {
  bigserial,
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { messages } from './messages.schema';
import { rooms } from './rooms.schema';
import { users } from './users.schema';

export const moderationEventTypeEnum = pgEnum('moderation_event_type', [
  'VIOLATION_DETECTED',
  'SANCTION_IMPOSED',
  'SANCTION_REVOKED',
]);

//İşlemi kimin yaptığı bilgisi tutulur. Örn: sistem, admin
export const moderationActorTypeEnum = pgEnum('moderation_actor_type', ['SYSTEM', 'ADMIN']);

export const moderationEvents = pgTable(
  'moderation_events',
  {
    seq: bigserial('seq', { mode: 'number' }).primaryKey(),
    id: uuid('id').notNull().unique().defaultRandom(),
    eventType: moderationEventTypeEnum('event_type').notNull(),
    /*Kaydın türü.
    VIOLATION_DETECTED: ihlal tespit edildi
    SANCTION_IMPOSED: ceza verildi
    SANCTION_REVOKED: ceza kaldırıldı*/
    actorType: moderationActorTypeEnum('actor_type').notNull(),
    actorId: uuid('actor_id').references(() => users.id),
    subjectUserId: uuid('subject_user_id') //İşlem yapılan kullanıcı. Örn: ihlali yapan kullanıcı, ceza verilen kullanıcı
      .notNull()
      .references(() => users.id),
    roomId: uuid('room_id').references(() => rooms.id),
    messageId: uuid('message_id').references(() => messages.id),
    refersToEventId: uuid('refers_to_event_id'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(), //Kaydın detayları, jsonb olarak. İhlal kaydında mesajın metni, karar ve takılınan kuralların o anki hali burada durur.
    traceId: varchar('trace_id', { length: 64 }),
    occurredAt: timestamp('occurred_at', { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('moderation_events_subject_idx').on(table.subjectUserId, table.occurredAt),
    index('moderation_events_type_idx').on(table.eventType, table.occurredAt),
  ],
);
