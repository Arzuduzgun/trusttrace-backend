import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdminRoomsController } from './admin-rooms.controller';
import { RoomsController } from './rooms.controller';
import { RoomsRepository } from './rooms.repository';
import { RoomsService } from './rooms.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { RoomStatusService } from './room-status.service';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [RoomsController, AdminRoomsController],
  providers: [RoomsService, RoomsRepository, RoomStatusService],
  exports: [RoomsService],
})
export class RoomsModule {}
