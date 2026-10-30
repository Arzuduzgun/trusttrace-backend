import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { ruleActionEnum } from '../../../database/schema';
import type { RuleAction } from '../moderation.types';

export class UpdateRuleDto {
  @IsOptional()
  @IsIn(ruleActionEnum.enumValues)
  action?: RuleAction;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
