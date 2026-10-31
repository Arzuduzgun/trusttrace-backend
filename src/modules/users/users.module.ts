import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin-users.controller';
import { ModerationEventsModule } from '../moderation-events/moderation-events.module';

@Module({
  imports: [ModerationEventsModule],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
