import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DomainException } from '../../common/errors/domain.exception';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';
import { isUniqueViolation } from '../../database/postgres-errors';
import { moderationRules } from '../../database/schema';
import { MODERATION_ERRORS } from './moderation.errors';
import type { ModerationRule, NewModerationRule, RuleChanges } from './moderation.types';

const RULE_COLUMNS = {
  id: moderationRules.id,
  pattern: moderationRules.pattern,
  matchType: moderationRules.matchType,
  action: moderationRules.action,
  isActive: moderationRules.isActive,
  createdAt: moderationRules.createdAt,
};

@Injectable()
export class ModerationRulesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  //Bütün kurallar, aktif ve kapalı. Admin paneli için.
  listAll(): Promise<ModerationRule[]> {
    return this.db
      .select(RULE_COLUMNS)
      .from(moderationRules)
      .orderBy(desc(moderationRules.createdAt));
  }
  listActive(): Promise<ModerationRule[]> {
    return this.db
      .select(RULE_COLUMNS)
      .from(moderationRules)
      .where(eq(moderationRules.isActive, true));
  }
  async findById(id: string): Promise<ModerationRule | null> {
    const [row] = await this.db
      .select(RULE_COLUMNS)
      .from(moderationRules)
      .where(eq(moderationRules.id, id))
      .limit(1);
    return row ?? null;
  }
  async create(newRule: NewModerationRule): Promise<ModerationRule> {
    try {
      const [row] = await this.db.insert(moderationRules).values(newRule).returning(RULE_COLUMNS);
      if (!row) {
        throw new Error('Rule insert returned no row');
      }
      return row;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DomainException(MODERATION_ERRORS.MODERATION_RULE_ALREADY_EXISTS);
      }
      throw error;
    }
  }
  async update(id: string, changes: RuleChanges): Promise<ModerationRule | null> {
    const [row] = await this.db
      .update(moderationRules)
      .set(changes)
      .where(eq(moderationRules.id, id))
      .returning(RULE_COLUMNS);
    return row ?? null;
  }
}
