import type { ruleActionEnum, ruleMatchTypeEnum } from '../../database/schema';

export type RuleMatchType = (typeof ruleMatchTypeEnum.enumValues)[number];
export type RuleAction = (typeof ruleActionEnum.enumValues)[number];

export interface ModerationRule {
  id: string;
  pattern: string;
  matchType: RuleMatchType;
  action: RuleAction;
  isActive: boolean;
  createdAt: Date;
}

export interface NewModerationRule {
  pattern: string;
  matchType: RuleMatchType;
  action: RuleAction;
  createdBy: string;
}

export interface RuleChanges {
  action?: RuleAction;
  isActive?: boolean;
}

export type ScanVerdict = 'CLEAN' | 'FLAG' | 'BLOCK';

export interface RuleMatch {
  ruleId: string;
  pattern: string;
  action: RuleAction;
}

export interface ScanResult {
  verdict: ScanVerdict;
  matches: RuleMatch[];
}
