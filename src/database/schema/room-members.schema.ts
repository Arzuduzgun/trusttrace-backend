/*Hangi kullanıcının hangi odada olduğunu tutar. 
Bir kullanıcı birçok odada olabilir, bir odada da birçok kullanıcı olabilir.*/
import { index, pgEnum, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { rooms } from './rooms.schema';
import { users } from './users.schema';

export const memberRoleEnum = pgEnum('member_role', ['CUSTOMER', 'AGENT']);

export const roomMembers = pgTable(
  'room_members',
  {
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }), //Bir oda silinirse üyelik kayıtları da silinir.
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    memberRole: memberRoleEnum('member_role').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.roomId, table.userId] }), //Aynı kişi aynı odaya iki kez eklenemez.
    index('room_members_user_idx').on(table.userId),
  ],
);
