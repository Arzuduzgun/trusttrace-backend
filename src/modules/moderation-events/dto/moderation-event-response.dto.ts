import type {
  ModerationActorType,
  ModerationEvent,
  ModerationEventType,
} from '../moderation-events.types';

export class ModerationEventResponseDto {
  seq!: number;
  id!: string;
  eventType!: ModerationEventType;
  actorType!: ModerationActorType;
  actorId!: string | null;
  subjectUserId!: string;
  roomId!: string | null;
  messageId!: string | null;
  refersToEventId!: string | null;
  payload!: Record<string, unknown>;
  occurredAt!: Date;

  static from(event: ModerationEvent): ModerationEventResponseDto {
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
    };
  }
}
