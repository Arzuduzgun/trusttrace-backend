import { ApiProperty } from '@nestjs/swagger';
import { notificationTypeEnum } from '../../../database/schema';
import type { Notification, NotificationType } from '../types/notifications.types';

export class NotificationResponseDto {
  id!: string;
  @ApiProperty({ enum: notificationTypeEnum.enumValues, enumName: 'NotificationType' })
  type!: NotificationType;
  roomId!: string | null;
  @ApiProperty({ type: 'object', additionalProperties: true })
  payload!: Record<string, unknown>;
  readAt!: Date | null;
  createdAt!: Date;

  static from(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type,
      roomId: notification.roomId,
      payload: notification.payload,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
