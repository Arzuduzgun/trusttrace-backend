import { index, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { rooms } from './rooms.schema';
import { users } from './users.schema';

/*status: Mesajın durumu.
DELIVERED: temiz, iletildi
FLAGGED: işaretlendi ama iletildi
BLOCKED: engellendi, iletilmedi*/
export const messageStatusEnum = pgEnum('message_status', ['DELIVERED', 'FLAGGED', 'BLOCKED']);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id),
    body: text('body').notNull(),
    clientMessageId: uuid('client_message_id').notNull(),
    /*Mesajı gönderen tarayıcının ürettiği id. İnternet kopup tarayıcı aynı mesajı tekrar gönderirse, 
    unique(senderId, clientMessageId) kuralı sayesinde ikinci kayıt oluşmaz. 
    Mesaj iki kez görünmez*/
    status: messageStatusEnum('status').notNull().default('DELIVERED'),
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull().defaultNow(),
  },
  (table) => [
    unique('messages_sender_client_id_unique').on(table.senderId, table.clientMessageId),
    index('messages_room_created_idx').on(table.roomId, table.createdAt, table.id), //“Bu odanın son 50 mesajı” sorgusu hızlı çalışsın diye.
  ],
);
