import { Module } from '@nestjs/common';
import { AdminModerationEventsController } from './admin-moderation-events.controller';
import { ModerationEventsRepository } from './moderation-events.repository';
import { ModerationEventsService } from './moderation-events.service';

@Module({
  controllers: [AdminModerationEventsController],
  providers: [ModerationEventsService, ModerationEventsRepository],
  exports: [ModerationEventsService, ModerationEventsRepository],
})
export class ModerationEventsModule {}
