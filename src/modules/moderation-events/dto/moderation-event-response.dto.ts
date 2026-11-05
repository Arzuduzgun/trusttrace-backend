import { ApiProperty } from '@nestjs/swagger';
import { moderationActorTypeEnum, moderationEventTypeEnum } from '../../../database/schema';
import type {
  ChainedModerationEvent,
  ModerationActorType,
  ModerationEventType,
} from '../types/moderation-events.types';

export class ModerationEventResponseDto {
  seq!: number;
  id!: string;
  @ApiProperty({ enum: moderationEventTypeEnum.enumValues, enumName: 'ModerationEventType' })
  eventType!: ModerationEventType;
  @ApiProperty({ enum: moderationActorTypeEnum.enumValues, enumName: 'ModerationActorType' })
  actorType!: ModerationActorType;
  actorId!: string | null;
  subjectUserId!: string;
  roomId!: string | null;
  messageId!: string | null;
  refersToEventId!: string | null;
  @ApiProperty({ type: 'object', additionalProperties: true })
  payload!: Record<string, unknown>;
  occurredAt!: Date;
  prevHash!: string;
  hash!: string;

  static from(event: ChainedModerationEvent): ModerationEventResponseDto {
    return {
      seq: event.seq,
      id: event.id,
      eventType: event.eventType,
      actorType: event.actorType,
      actorId: event.actorId,
      subjectUserId: event.subjectUserId,
      roomId: event.roomId,
      messageId: event.messageId,
      refersToEventId: event.refersToEventId,
      payload: event.payload,
      occurredAt: event.occurredAt,
      prevHash: event.prevHash,
      hash: event.hash,
    };
  }
}
