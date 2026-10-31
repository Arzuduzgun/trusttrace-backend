import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './database/database.module';
import { AppLoggerModule } from './common/logging/app-logger.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ChatModule } from './modules/chat/chat.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { ModerationEventsModule } from './modules/moderation-events/moderation-events.module';
import { SanctionsModule } from './modules/sanctions/sanctions.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AppLoggerModule,
    HealthModule,
    UsersModule,
    AuthModule,
    RoomsModule,
    ChatModule,
    ModerationModule,
    ModerationEventsModule,
    SanctionsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
