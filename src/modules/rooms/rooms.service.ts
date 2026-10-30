//Odalarla ilgili bütün kurallar burada. SQL yazmaz; repository’yi ve users servisini çağırır.
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { UsersService } from '../users/users.service';
import type { User } from '../users/users.types';
import { ROOM_ERRORS } from './rooms.errors';
import { RoomsRepository } from './rooms.repository';
import type { Room } from './rooms.types';

@Injectable()
export class RoomsService {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly usersService: UsersService,
  ) {}
  //Admin ise bütün odaları, değilse sadece üyesi olduğu odaları döner.
  listMyRooms(user: User): Promise<Room[]> {
    return user.role === 'ADMIN'
      ? this.roomsRepository.listAll()
      : this.roomsRepository.listForUser(user.id);
  }
  //Katılınabilecek, kapalı olmayan ürün odaları.
  listProductRooms(): Promise<Room[]> {
    return this.roomsRepository.listOpenByType('PRODUCT');
  }
  //En az meşgul temsilciyi bulur ve müşteriyle birlikte 1-1 bir oda açar. Oda adı otomatik olur
  async startDirectRoom(customer: User): Promise<Room> {
    const agent = await this.pickLeastBusyAgent();
    return this.roomsRepository.createWithMembers(
      {
        type: 'DIRECT',
        name: `${customer.displayName} – ${agent.displayName}`,
        createdBy: customer.id,
      },
      [
        { userId: customer.id, memberRole: 'CUSTOMER' },
        { userId: agent.id, memberRole: 'AGENT' },
      ],
    );
  }
  //Müşteriyi bir ürün odasına ekler. Oda 1-1 ise ya da kapalıysa ROOM_NOT_JOINABLE fırlatır.
  async joinProductRoom(roomId: string, customer: User): Promise<Room> {
    const room = await this.getRoom(roomId);
    if (room.type !== 'PRODUCT' || room.status === 'CLOSED') {
      throw new DomainException(ROOM_ERRORS.ROOM_NOT_JOINABLE);
    }
    await this.roomsRepository.addMember(room.id, { userId: customer.id, memberRole: 'CUSTOMER' });
    return room;
  }
  //Admin yeni bir ürün odası açar.
  createProductRoom(name: string, admin: User): Promise<Room> {
    return this.roomsRepository.createWithMembers(
      { type: 'PRODUCT', name, createdBy: admin.id },
      [],
    );
  }
  //Admin bir kişiyi odaya ekler. Kişinin odadaki rolü, kendi hesap rolünden çıkarılır
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
  //“Bu kişi bu odaya erişebilir mi?” sorusunu cevaplar.
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
  //Aktif temsilcileri alır, her birinin açık oda sayısına bakar ve en az olanı seçer. Hiç temsilci yoksa ROOM_NO_AGENT_AVAILABLE fırlatır.
  private async pickLeastBusyAgent(): Promise<User> {
    const [firstAgent, ...otherAgents] = await this.usersService.listActiveAgents();
    if (!firstAgent) {
      throw new DomainException(ROOM_ERRORS.ROOM_NO_AGENT_AVAILABLE);
    }
    const load = await this.roomsRepository.countActiveRoomsPerUser([
      firstAgent.id,
      ...otherAgents.map((agent) => agent.id),
    ]);
    const roomsOf = (agent: User): number => load.get(agent.id) ?? 0;
    return otherAgents.reduce(
      (best, agent) => (roomsOf(agent) < roomsOf(best) ? agent : best),
      firstAgent,
    );
  }
}
