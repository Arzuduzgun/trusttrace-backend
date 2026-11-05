import { Injectable } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import type { User } from '../users/types/users.types';
import { ROOM_ERRORS } from './rooms.errors';
import { RoomsRepository } from './rooms.repository';
import { RoomsService } from './rooms.service';
import type { Room, RoomStatus } from './types/rooms.types';

@Injectable()
export class RoomStatusService {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly roomsRepository: RoomsRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async escalate(roomId: string, agent: User, note: string | undefined): Promise<Room> {
    await this.roomsService.assertCanAccess(roomId, agent);
    const room = await this.roomsRepository.updateStatus(roomId, 'ESCALATED', 'OPEN');
    if (!room) {
      throw new DomainException(ROOM_ERRORS.ROOM_NOT_ESCALATABLE);
    }
    const admins = await this.usersService.listActiveAdmins();
    await this.notificationsService.notifyRoomEscalated(
      admins.map((admin) => admin.id),
      room,
      agent.displayName,
      note ?? null,
    );
    return room;
  }

  async setStatus(roomId: string, status: RoomStatus): Promise<Room> {
    const room = await this.roomsRepository.updateStatus(roomId, status);
    if (!room) {
      throw new DomainException(ROOM_ERRORS.ROOM_NOT_FOUND);
    }
    return room;
  }
}
