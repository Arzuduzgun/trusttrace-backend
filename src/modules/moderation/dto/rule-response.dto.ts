import { ApiProperty } from '@nestjs/swagger';
import { ruleActionEnum, ruleMatchTypeEnum } from '../../../database/schema';
import type { ModerationRule, RuleAction, RuleMatchType } from '../types/moderation.types';

export class RuleResponseDto {
  id!: string;
  pattern!: string;
  @ApiProperty({ enum: ruleMatchTypeEnum.enumValues, enumName: 'RuleMatchType' })
  matchType!: RuleMatchType;
  @ApiProperty({ enum: ruleActionEnum.enumValues, enumName: 'RuleAction' })
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
