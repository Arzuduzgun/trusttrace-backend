import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { ruleActionEnum } from '../../../database/schema';
import type { RuleAction } from '../moderation.types';

export class CreateRuleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  pattern!: string;

  @IsIn(ruleActionEnum.enumValues)
  action!: RuleAction;
}
