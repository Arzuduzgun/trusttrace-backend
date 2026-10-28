// users tablosu. Rol ve durum listeleri burada; TypeScript tipleri buradan türetilir.
import { pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['CUSTOMER', 'AGENT', 'ADMIN']);
// Anlık durum (hızlı kontrol için). Cezanın tam geçmişi moderation_events tablosunda.
export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'SUSPENDED', 'BANNED']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 254 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 80 }).notNull(),
  role: userRoleEnum('role').notNull().default('CUSTOMER'),
  status: userStatusEnum('status').notNull().default('ACTIVE'),
  suspendedUntil: timestamp('suspended_until', { withTimezone: true }),
  // Bu tarihten önce verilmiş token'lar geçersiz. Ban'da "şimdi" yapılır.
  tokensValidAfter: timestamp('tokens_valid_after', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
