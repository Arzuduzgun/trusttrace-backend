import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { UsersService } from '../users/users.service';
import type { User } from '../users/types/users.types';
import { ROOM_ERRORS } from './rooms.errors';
import { RoomsRepository } from './rooms.repository';
import type { Room, RoomMemberView } from './types/rooms.types';
import { PresenceService } from '../../redis/presence.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly usersService: UsersService,
    private readonly presence: PresenceService,
    private readonly notificationsService: NotificationsService,
  ) {}
  listMyRooms(user: User): Promise<Room[]> {
    return user.role === 'ADMIN'
      ? this.roomsRepository.listAll()
      : this.roomsRepository.listForUser(user.id);
  }
  listProductRooms(): Promise<Room[]> {
    return this.roomsRepository.listOpenByType('PRODUCT');
  }
  async startDirectRoom(customer: User): Promise<Room> {
    const agents = await this.usersService.listActiveAgents();
    if (agents.length === 0) {
      throw new DomainException(ROOM_ERRORS.ROOM_NO_AGENT_AVAILABLE);
    }
    const candidates = await this.preferOnline(agents);
    const assignment: { agentId?: string } = {};
    const room = await this.roomsRepository.createAssigned(
      candidates.map((agent) => agent.id),
      (load) => {
        const agent = this.leastBusy(candidates, load);
        assignment.agentId = agent.id;
        return {
          room: {
            type: 'DIRECT',
            name: `${customer.displayName} – ${agent.displayName}`,
            createdBy: customer.id,
          },
          members: [
            { userId: customer.id, memberRole: 'CUSTOMER' },
            { userId: agent.id, memberRole: 'AGENT' },
          ],
        };
      },
    );
    if (assignment.agentId) {
      await this.notificationsService.notifyRoomAssigned(
        assignment.agentId,
        room.id,
        customer.displayName,
      );
    }
    return room;
  }
  async joinProductRoom(roomId: string, customer: User): Promise<Room> {
    const room = await this.getRoom(roomId);
    if (room.type !== 'PRODUCT' || room.status === 'CLOSED') {
      throw new DomainException(ROOM_ERRORS.ROOM_NOT_JOINABLE);
    }
    await this.roomsRepository.addMember(room.id, { userId: customer.id, memberRole: 'CUSTOMER' });
    return room;
  }
  createProductRoom(name: string, admin: User): Promise<Room> {
    return this.roomsRepository.createWithMembers(
      { type: 'PRODUCT', name, createdBy: admin.id },
      [],
    );
  }
  async addMember(roomId: string, userId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    const user = await this.usersService.getById(userId);
    if (user.role === 'ADMIN') {
      throw new DomainException(ROOM_ERRORS.ROOM_NOT_JOINABLE);
    }
    await this.roomsRepository.addMember(room.id, {
      userId: user.id,
      memberRole: user.role === 'AGENT' ? 'AGENT' : 'CUSTOMER',
    });
  }
  async assertCanAccess(roomId: string, user: User): Promise<Room> {
    const room = await this.getRoom(roomId);
    if (user.role === 'ADMIN') {
      return room;
    }
    const memberRole = await this.roomsRepository.findMemberRole(room.id, user.id);
    if (!memberRole) {
      throw new DomainException(ROOM_ERRORS.ROOM_ACCESS_DENIED);
    }
    return room;
  }

  private async getRoom(roomId: string): Promise<Room> {
    const room = await this.roomsRepository.findById(roomId);
    if (!room) {
      throw new DomainException(ROOM_ERRORS.ROOM_NOT_FOUND);
    }
    return room;
  }

  private async preferOnline(agents: User[]): Promise<User[]> {
    try {
      const online = await this.presence.onlineAmong(agents.map((agent) => agent.id));
      const onlineAgents = agents.filter((agent) => online.has(agent.id));
      return onlineAgents.length > 0 ? onlineAgents : agents;
    } catch (error) {
      this.logger.warn(`Presence unavailable, using all agents: ${String(error)}`);
      return agents;
    }
  }

  private leastBusy([first, ...others]: User[], load: Map<string, number>): User {
    if (!first) {
      throw new DomainException(ROOM_ERRORS.ROOM_NO_AGENT_AVAILABLE);
    }
    const roomsOf = (agent: User): number => load.get(agent.id) ?? 0;
    return others.reduce((best, agent) => (roomsOf(agent) < roomsOf(best) ? agent : best), first);
  }
  async listMembers(roomId: string, viewer: User): Promise<RoomMemberView[]> {
    await this.assertCanAccess(roomId, viewer);
    const members = await this.roomsRepository.listMembers(roomId);
    const online = await this.presence
      .onlineAmong(members.map((member) => member.userId))
      .catch(() => new Set<string>());
    const isStaff = viewer.role !== 'CUSTOMER';
    return members.map((member) => ({
      userId: member.userId,
      displayName: member.displayName,
      memberRole: member.memberRole,
      isOnline: online.has(member.userId),
      lastReadAt: isStaff ? member.lastReadAt : null,
      email: isStaff ? member.email : null,
      status: isStaff ? member.status : null,
      suspendedUntil: isStaff ? member.suspendedUntil : null,
    }));
  }

  async markRead(roomId: string, user: User): Promise<Date | null> {
    await this.assertCanAccess(roomId, user);
    return this.roomsRepository.markRead(roomId, user.id);
  }
}
