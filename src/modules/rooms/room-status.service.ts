import { Injectable } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import type { User } from '../users/types/users.types';
import { ROOM_ERRORS } from './rooms.errors';
import { RoomsRepository } from './rooms.repository';
import { RoomsService } from './rooms.service';
import type { Room, RoomStatus } from './types/rooms.types';
import { EscalateRoomDto } from './dto/escalate-room.dto';

@Injectable()
export class RoomStatusService {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly roomsRepository: RoomsRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async escalate(roomId: string, agent: User, dto: EscalateRoomDto): Promise<Room> {
    await this.roomsService.assertCanAccess(roomId, agent);
    const memberRole = await this.roomsRepository.findMemberRole(roomId, dto.customerId);
    if (memberRole !== 'CUSTOMER') {
      throw new DomainException(ROOM_ERRORS.ROOM_MEMBER_NOT_CUSTOMER);
    }
    const customer = await this.usersService.getById(dto.customerId);
    const room = await this.roomsRepository.escalateWithReport(roomId, {
      eventType: 'USER_REPORTED',
      actorType: 'AGENT',
      actorId: agent.id,
      subjectUserId: customer.id,
      roomId,
      messageId: null,
      refersToEventId: null,
      traceId: null,
      payload: { reasonCode: dto.reasonCode, note: dto.note ?? null },
    });
    if (!room) {
      throw new DomainException(ROOM_ERRORS.ROOM_NOT_ESCALATABLE);
    }
    const admins = await this.usersService.listActiveAdmins();
    await this.notificationsService.notifyRoomEscalated(
      admins.map((admin) => admin.id),
      room,
      {
        agentName: agent.displayName,
        customerName: customer.displayName,
        reasonCode: dto.reasonCode,
        note: dto.note ?? null,
      },
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
