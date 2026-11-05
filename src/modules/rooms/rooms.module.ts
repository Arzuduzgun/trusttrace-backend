import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdminRoomsController } from './admin-rooms.controller';
import { RoomsController } from './rooms.controller';
import { RoomsRepository } from './rooms.repository';
import { RoomsService } from './rooms.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [RoomsController, AdminRoomsController],
  providers: [RoomsService, RoomsRepository],
  exports: [RoomsService],
})
export class RoomsModule {}
