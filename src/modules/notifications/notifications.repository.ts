import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';
import { notifications } from '../../database/schema';
import type { NewNotification, Notification } from './types/notifications.types';

const NOTIFICATION_COLUMNS = {
  id: notifications.id,
  userId: notifications.userId,
  type: notifications.type,
  roomId: notifications.roomId,
  payload: notifications.payload,
  readAt: notifications.readAt,
  createdAt: notifications.createdAt,
};

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(newNotification: NewNotification): Promise<Notification> {
    const [row] = await this.db
      .insert(notifications)
      .values(newNotification)
      .returning(NOTIFICATION_COLUMNS);
    if (!row) {
      throw new Error('Notification insert returned no row');
    }
    return row;
  }

  listForUser(userId: string, limit: number): Promise<Notification[]> {
    return this.db
      .select(NOTIFICATION_COLUMNS)
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markRead(userId: string, id: string): Promise<boolean> {
    const [row] = await this.db
      .update(notifications)
      .set({ readAt: sql`coalesce(${notifications.readAt}, now())` })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning({ id: notifications.id });
    return row !== undefined;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  }
}
