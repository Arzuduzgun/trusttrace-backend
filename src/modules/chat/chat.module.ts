import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ModerationModule } from '../moderation/moderation.module';
import { ModerationEventsModule } from '../moderation-events/moderation-events.module';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';
import { ChatGateway } from './chat.gateway';
import { ChatNotifierService } from './chat-notifier.service';
import { MessagesController } from './messages.controller';
import { MessagesRepository } from './messages.repository';
import { MessagesService } from './messages.service';

@Module({
  imports: [AuthModule, RoomsModule, UsersModule, ModerationModule, ModerationEventsModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository, ChatGateway, ChatNotifierService],
  exports: [ChatNotifierService],
})
export class ChatModule {}