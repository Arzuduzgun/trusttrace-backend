import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { ruleActionEnum } from '../../../database/schema';
import type { RuleAction } from '../types/moderation.types';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRuleDto {
  @IsOptional()
  @IsIn(ruleActionEnum.enumValues)
  @ApiProperty({ enum: ruleActionEnum.enumValues, enumName: 'RuleAction', required: false })
  action?: RuleAction;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
