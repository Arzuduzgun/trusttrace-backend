import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { moderationEventTypeEnum } from '../../../database/schema';
import type { ModerationEventType } from '../moderation-events.types';

export class ModerationEventQueryDto {
  @IsOptional()
  @IsIn(moderationEventTypeEnum.enumValues)
  eventType?: ModerationEventType;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
