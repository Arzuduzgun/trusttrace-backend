import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { moderationEventTypeEnum } from '../../../database/schema';
import type { ModerationEventType } from '../types/moderation-events.types';
import { ApiProperty } from '@nestjs/swagger';

export class ModerationEventQueryDto {
  @IsOptional()
  @IsIn(moderationEventTypeEnum.enumValues)
  @ApiProperty({
    enum: moderationEventTypeEnum.enumValues,
    enumName: 'ModerationEventType',
    required: false,
  })
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
