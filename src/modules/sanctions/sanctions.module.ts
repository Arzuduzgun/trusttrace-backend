import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { ModerationEventsModule } from '../moderation-events/moderation-events.module';
import { UsersModule } from '../users/users.module';
import { AdminSanctionsController } from './admin-sanctions.controller';
import { SanctionsService } from './sanctions.service';

@Module({
  imports: [UsersModule, AuthModule, ModerationEventsModule, ChatModule],
  controllers: [AdminSanctionsController],
  providers: [SanctionsService],
})
export class SanctionsModule {}
