import { Injectable } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { ChatNotifierService } from '../../realtime/chat-notifier.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { ROOM_ERRORS } from './rooms.errors';
import { RoomsRepository } from './rooms.repository';

@Injectable()
export class RoomAgentsService {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly chatNotifier: ChatNotifierService,
  ) {}

  async replaceAgent(roomId: string, currentAgentId: string, newAgentId: string): Promise<void> {
    if (currentAgentId === newAgentId) {
      throw new DomainException(ROOM_ERRORS.ROOM_INVALID_AGENT);
    }
    const room = await this.roomsRepository.findById(roomId);
    if (!room) {
      throw new DomainException(ROOM_ERRORS.ROOM_NOT_FOUND);
    }
    const newAgent = await this.usersService.getById(newAgentId);
    if (newAgent.role !== 'AGENT' || newAgent.status !== 'ACTIVE') {
      throw new DomainException(ROOM_ERRORS.ROOM_INVALID_AGENT);
    }
    await this.roomsRepository.replaceAgent(room.id, currentAgentId, newAgent.id);
    this.chatNotifier.removeFromRoom(currentAgentId, room.id);
    await this.notificationsService.notifyRoomAssigned(newAgent.id, room.id, room.name);
  }
}
