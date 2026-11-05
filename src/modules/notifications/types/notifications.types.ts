import type { notificationTypeEnum } from '../../../database/schema';

export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  roomId: string | null;
  payload: Record<string, unknown>;
  readAt: Date | null;
  createdAt: Date;
}

export type NewNotification = Pick<Notification, 'userId' | 'type' | 'roomId' | 'payload'>;
