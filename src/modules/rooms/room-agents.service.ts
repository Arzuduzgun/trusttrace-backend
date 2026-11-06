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
    if (await this.roomsRepository.findMemberRole(room.id, newAgent.id)) {
      throw new DomainException(ROOM_ERRORS.ROOM_MEMBER_ALREADY_EXISTS);
    }
    const newName =
      room.type === 'DIRECT' ? await this.directRoomName(room.id, newAgent.displayName) : null;
    await this.roomsRepository.replaceAgent(room.id, currentAgentId, newAgent.id, newName);
    this.chatNotifier.removeFromRoom(currentAgentId, room.id);
    await this.notificationsService.notifyRoomAssigned(newAgent.id, room.id, newName ?? room.name);
  }

  private async directRoomName(roomId: string, agentName: string): Promise<string | null> {
    const members = await this.roomsRepository.listMembers(roomId);
    const customer = members.find((member) => member.memberRole === 'CUSTOMER');
    return customer ? `${customer.displayName} – ${agentName}` : null;
  }
}
