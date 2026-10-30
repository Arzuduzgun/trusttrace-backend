import { Module } from '@nestjs/common';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';
import { MessagesController } from './messages.controller';
import { MessagesRepository } from './messages.repository';
import { MessagesService } from './messages.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, RoomsModule, UsersModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository, ChatGateway],
})
export class ChatModule {}
