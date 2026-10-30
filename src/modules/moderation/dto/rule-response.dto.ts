import type { ModerationRule, RuleAction, RuleMatchType } from '../moderation.types';

export class RuleResponseDto {
  id!: string;
  pattern!: string;
  matchType!: RuleMatchType;
  action!: RuleAction;
  isActive!: boolean;
  createdAt!: Date;

  static from(rule: ModerationRule): RuleResponseDto {
    return {
      id: rule.id,
      pattern: rule.pattern,
      matchType: rule.matchType,
      action: rule.action,
      isActive: rule.isActive,
      createdAt: rule.createdAt,
    };
  }
}
