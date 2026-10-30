//rooms ve room_members tablolarının bütün SQL’i burada.
/*Birleştirme sebebi şu: 1-1 oda açarken “odayı oluştur” ve 
“iki kişiyi üye yap” işlemleri aynı transaction’da olmalı. Biri olup diğeri 
olmazsa üyesiz bir oda kalır*/
import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, inArray, ne } from 'drizzle-orm';
import { DomainException } from '../../common/errors/domain.exception';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';
import { isUniqueViolation } from '../../database/postgres-errors';
import { roomMembers, rooms } from '../../database/schema';
import { ROOM_ERRORS } from './rooms.errors';
import type { MemberRole, NewRoom, NewRoomMember, Room, RoomType } from './rooms.types';

const ROOM_COLUMNS = {
  id: rooms.id,
  type: rooms.type,
  name: rooms.name,
  status: rooms.status,
  createdAt: rooms.createdAt,
};

@Injectable()
export class RoomsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  //Tek bir oda getirir. Yoksa null.
  async findById(id: string): Promise<Room | null> {
    const [row] = await this.db.select(ROOM_COLUMNS).from(rooms).where(eq(rooms.id, id)).limit(1);
    return row ?? null;
  }
  //Odayı ve üyelerini tek transaction’da oluşturur.
  async createWithMembers(newRoom: NewRoom, members: NewRoomMember[]): Promise<Room> {
    return this.db.transaction(async (tx) => {
      const [room] = await tx.insert(rooms).values(newRoom).returning(ROOM_COLUMNS);
      if (!room) {
        throw new Error('Room insert returned no row');
      }
      if (members.length > 0) {
        await tx
          .insert(roomMembers)
          .values(members.map((member) => ({ ...member, roomId: room.id })));
      }
      return room;
    });
  }
  //Odaya bir üye ekler. Kişi zaten üyeyse ROOM_MEMBER_ALREADY_EXISTS fırlatır.
  async addMember(roomId: string, member: NewRoomMember): Promise<void> {
    try {
      await this.db.insert(roomMembers).values({ ...member, roomId });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DomainException(ROOM_ERRORS.ROOM_MEMBER_ALREADY_EXISTS);
      }
      throw error;
    }
  }
  //Kişi bu odanın üyesi mi? Üyeyse rolünü, değilse null döner.
  async findMemberRole(roomId: string, userId: string): Promise<MemberRole | null> {
    const [row] = await this.db
      .select({ memberRole: roomMembers.memberRole })
      .from(roomMembers)
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)))
      .limit(1);
    return row?.memberRole ?? null;
  }
  //Kişinin üyesi olduğu odalar, en yeni en üstte.
  listForUser(userId: string): Promise<Room[]> {
    return this.db
      .select(ROOM_COLUMNS)
      .from(rooms)
      .innerJoin(roomMembers, eq(roomMembers.roomId, rooms.id))
      .where(eq(roomMembers.userId, userId))
      .orderBy(desc(rooms.createdAt));
  }
  //Bütün odalar. Admin için.
  listAll(): Promise<Room[]> {
    return this.db.select(ROOM_COLUMNS).from(rooms).orderBy(desc(rooms.createdAt));
  }
  //Kapalı olmayan, belirli tipteki odalar.
  listOpenByType(type: RoomType): Promise<Room[]> {
    return this.db
      .select(ROOM_COLUMNS)
      .from(rooms)
      .where(and(eq(rooms.type, type), ne(rooms.status, 'CLOSED')))
      .orderBy(desc(rooms.createdAt));
  }
  //Verilen her temsilcinin şu anda kaç açık odası var. “En az meşgul temsilci” seçimi bunu kullanır.
  async countActiveRoomsPerUser(userIds: string[]): Promise<Map<string, number>> {
    const rows = await this.db
      .select({ userId: roomMembers.userId, total: count() })
      .from(roomMembers)
      .innerJoin(rooms, eq(rooms.id, roomMembers.roomId))
      .where(and(inArray(roomMembers.userId, userIds), ne(rooms.status, 'CLOSED')))
      .groupBy(roomMembers.userId);
    return new Map(rows.map((row) => [row.userId, row.total]));
  }
}
