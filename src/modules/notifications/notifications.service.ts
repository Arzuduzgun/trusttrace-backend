import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { ChatNotifierService } from '../../realtime/chat-notifier.service';
import { CHAT_EVENTS } from '../chat/chat.events';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NOTIFICATION_ERRORS } from './notifications.errors';
import { NotificationsRepository } from './notifications.repository';
import type { Notification } from './types/notifications.types';

const LIST_LIMIT = 30;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly chatNotifier: ChatNotifierService,
  ) {}

  async notifyRoomAssigned(agentId: string, roomId: string, customerName: string): Promise<void> {
    try {
      const notification = await this.notificationsRepository.create({
        userId: agentId,
        type: 'ROOM_ASSIGNED',
        roomId,
        payload: { customerName },
      });
      this.chatNotifier.notifyUser(
        agentId,
        CHAT_EVENTS.NOTIFICATION_NEW,
        NotificationResponseDto.from(notification),
      );
    } catch (error) {
      this.logger.warn(`Notification could not be created: ${String(error)}`);
    }
  }

  listForUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.listForUser(userId, LIST_LIMIT);
  }

  async markRead(userId: string, id: string): Promise<void> {
    if (!(await this.notificationsRepository.markRead(userId, id))) {
      throw new DomainException(NOTIFICATION_ERRORS.NOTIFICATION_NOT_FOUND);
    }
  }

  markAllRead(userId: string): Promise<void> {
    return this.notificationsRepository.markAllRead(userId);
  }
}
