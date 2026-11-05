import type { moderationActorTypeEnum, moderationEventTypeEnum } from '../../../database/schema';

export type ModerationEventType = (typeof moderationEventTypeEnum.enumValues)[number];
export type ModerationActorType = (typeof moderationActorTypeEnum.enumValues)[number];

export interface ModerationEvent {
  seq: number;
  id: string;
  eventType: ModerationEventType;
  actorType: ModerationActorType;
  actorId: string | null;
  subjectUserId: string;
  roomId: string | null;
  messageId: string | null;
  refersToEventId: string | null;
  payload: Record<string, unknown>;
  traceId: string | null;
  occurredAt: Date;
}

export type NewModerationEvent = Omit<ModerationEvent, 'seq' | 'id' | 'occurredAt'>;

export interface ModerationEventFilter {
  eventType?: ModerationEventType;
  userId?: string;
  roomId?: string;
  limit: number;
}

export type HashableEvent = Omit<ModerationEvent, 'seq'>;

export interface ChainedModerationEvent extends ModerationEvent {
  prevHash: string;
  hash: string;
}

export type ChainBreakReason = 'PREV_HASH_MISMATCH' | 'CONTENT_HASH_MISMATCH';

export interface ChainVerification {
  valid: boolean;
  checkedCount: number;
  brokenAtSeq: number | null;
  reason: ChainBreakReason | null;
  headHash: string | null;
  verifiedAt: Date;
}
