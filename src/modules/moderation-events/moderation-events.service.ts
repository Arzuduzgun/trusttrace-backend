//Admin paneli için kayıtları listeler
import { Injectable } from '@nestjs/common';
import { ModerationEventsRepository } from './moderation-events.repository';
import type { ModerationEvent, ModerationEventFilter } from './moderation-events.types';

@Injectable()
export class ModerationEventsService {
  constructor(private readonly eventsRepository: ModerationEventsRepository) {}

  list(filter: ModerationEventFilter): Promise<ModerationEvent[]> {
    return this.eventsRepository.list(filter);
  }
}
