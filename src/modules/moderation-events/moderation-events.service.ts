import { Injectable } from '@nestjs/common';
import { ModerationEventsRepository } from './moderation-events.repository';
import type { ModerationEvent, ModerationEventFilter } from './types/moderation-events.types';

@Injectable()
export class ModerationEventsService {
  constructor(private readonly eventsRepository: ModerationEventsRepository) {}

  list(filter: ModerationEventFilter): Promise<ModerationEvent[]> {
    return this.eventsRepository.list(filter);
  }

  hasRevocation(eventId: string): Promise<boolean> {
    return this.eventsRepository.hasRevocation(eventId);
  }

  findLatestSanction(userId: string): Promise<ModerationEvent | null> {
    return this.eventsRepository.findLatestSanction(userId);
  }
}
