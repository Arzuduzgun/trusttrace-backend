import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const roomTypeEnum = pgEnum('room_type', ['DIRECT', 'PRODUCT']);
export const roomStatusEnum = pgEnum('room_status', ['OPEN', 'ESCALATED', 'CLOSED']);

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: roomTypeEnum('type').notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  status: roomStatusEnum('status').notNull().default('OPEN'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
