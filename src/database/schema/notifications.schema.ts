import { index, jsonb, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { rooms } from './rooms.schema';
import { users } from './users.schema';

export const notificationTypeEnum = pgEnum('notification_type', ['ROOM_ASSIGNED']);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull().defaultNow(),
  },
  (table) => [index('notifications_user_created_idx').on(table.userId, table.createdAt)],
);
