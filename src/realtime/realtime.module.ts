import { Global, Module } from '@nestjs/common';
import { ChatNotifierService } from './chat-notifier.service';

@Global()
@Module({
  providers: [ChatNotifierService],
  exports: [ChatNotifierService],
})
export class RealtimeModule {}
