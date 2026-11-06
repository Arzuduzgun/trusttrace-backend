import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdminRoomsController } from './admin-rooms.controller';
import { RoomsController } from './rooms.controller';
import { RoomsRepository } from './rooms.repository';
import { RoomsService } from './rooms.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { RoomStatusService } from './room-status.service';
import { RoomAgentsService } from './room-agents.service';
import { ModerationEventsModule } from '../moderation-events/moderation-events.module';

@Module({
  imports: [UsersModule, NotificationsModule, ModerationEventsModule],
  controllers: [RoomsController, AdminRoomsController],
  providers: [RoomsService, RoomsRepository, RoomStatusService, RoomAgentsService],
  exports: [RoomsService],
})
export class RoomsModule {}
