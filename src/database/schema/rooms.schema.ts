//Oda tablosunu tanımlar.
import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

//DIRECT (müşteri ile temsilci arasında 1-1) ve PRODUCT (ürün bazlı grup odası).
export const roomTypeEnum = pgEnum('room_type', ['DIRECT', 'PRODUCT']);
//OPEN (açık), ESCALATED (üst seviyeye aktarıldı), CLOSED (kapandı).
export const roomStatusEnum = pgEnum('room_status', ['OPEN', 'ESCALATED', 'CLOSED']);

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: roomTypeEnum('type').notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  status: roomStatusEnum('status').notNull().default('OPEN'),
  //Odayı kimin açtığı. users tablosuna bağlı.
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
