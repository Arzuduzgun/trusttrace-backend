//Yasaklı kelime ve cümlelerin tablosunu tanımlar.
import { boolean, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

/*WORD: tek kelime
PHRASE: birden fazla kelimeden oluşan cümle*/
export const ruleMatchTypeEnum = pgEnum('rule_match_type', ['WORD', 'PHRASE']);
export const ruleActionEnum = pgEnum('rule_action', ['FLAG', 'BLOCK']);

export const moderationRules = pgTable('moderation_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  pattern: varchar('pattern', { length: 200 }).notNull().unique(), //Yasaklı kelime ya da cümle. Temizlenmiş haliyle saklanır.
  matchType: ruleMatchTypeEnum('match_type').notNull(),
  action: ruleActionEnum('action').notNull(),
  isActive: boolean('is_active').notNull().default(true), //Kural silinmez, sadece kapatılır. Geçmişteki bir ihlalin hangi kurala takıldığı her zaman bulunabilmeli.
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
