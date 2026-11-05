import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, inArray, ne, sql } from 'drizzle-orm';
import { DomainException } from '../../common/errors/domain.exception';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database, DbExecutor } from '../../database/database.types';
import { isUniqueViolation } from '../../database/postgres-errors';
import { roomMembers, rooms, users } from '../../database/schema';
import { ROOM_ERRORS } from './rooms.errors';
import type {
  MemberRole,
  NewRoom,
  NewRoomMember,
  Room,
  RoomMemberDetail,
  RoomStatus,
  RoomType,
} from './types/rooms.types';
import { ModerationEventsRepository } from '../moderation-events/moderation-events.repository';
import { NewModerationEvent } from '../moderation-events/types/moderation-events.types';

const ROOM_COLUMNS = {
  id: rooms.id,
  type: rooms.type,
  name: rooms.name,
  status: rooms.status,
  createdAt: rooms.createdAt,
  productId: rooms.productId,
};

@Injectable()
export class RoomsRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly moderationEventsRepository: ModerationEventsRepository,
  ) {}

  async findById(id: string): Promise<Room | null> {
    const [row] = await this.db.select(ROOM_COLUMNS).from(rooms).where(eq(rooms.id, id)).limit(1);
    return row ?? null;
  }
  //Odayı ve üyelerini tek transaction’da oluşturur.
  async createWithMembers(newRoom: NewRoom, members: NewRoomMember[]): Promise<Room> {
    return this.db.transaction((tx) => this.insertRoomWithMembers(tx, newRoom, members));
  }

  async createAssigned(
    candidateIds: string[],
    build: (load: Map<string, number>) => { room: NewRoom; members: NewRoomMember[] },
  ): Promise<Room> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('agent-assignment'))`);
      const load = await this.countActiveRoomsPerUser(candidateIds, tx);
      const { room, members } = build(load);
      return this.insertRoomWithMembers(tx, room, members);
    });
  }

  private async insertRoomWithMembers(
    executor: DbExecutor,
    newRoom: NewRoom,
    members: NewRoomMember[],
  ): Promise<Room> {
    const [room] = await executor.insert(rooms).values(newRoom).returning(ROOM_COLUMNS);
    if (!room) {
      throw new Error('Room insert returned no row');
    }
    if (members.length > 0) {
      await executor
        .insert(roomMembers)
        .values(members.map((member) => ({ ...member, roomId: room.id })));
    }
    return room;
  }
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
  async findMemberRole(roomId: string, userId: string): Promise<MemberRole | null> {
    const [row] = await this.db
      .select({ memberRole: roomMembers.memberRole })
      .from(roomMembers)
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)))
      .limit(1);
    return row?.memberRole ?? null;
  }
  listForUser(userId: string): Promise<Room[]> {
    return this.db
      .select(ROOM_COLUMNS)
      .from(rooms)
      .innerJoin(roomMembers, eq(roomMembers.roomId, rooms.id))
      .where(eq(roomMembers.userId, userId))
      .orderBy(desc(rooms.createdAt));
  }
  listAll(): Promise<Room[]> {
    return this.db.select(ROOM_COLUMNS).from(rooms).orderBy(desc(rooms.createdAt));
  }
  listOpenByType(type: RoomType): Promise<Room[]> {
    return this.db
      .select(ROOM_COLUMNS)
      .from(rooms)
      .where(and(eq(rooms.type, type), ne(rooms.status, 'CLOSED')))
      .orderBy(desc(rooms.createdAt));
  }
  //Verilen her temsilcinin şu anda kaç açık odası var. “En az meşgul temsilci” seçimi bunu kullanır.
  async countActiveRoomsPerUser(
    userIds: string[],
    executor: DbExecutor = this.db,
  ): Promise<Map<string, number>> {
    const rows = await executor
      .select({ userId: roomMembers.userId, total: count() })
      .from(roomMembers)
      .innerJoin(rooms, eq(rooms.id, roomMembers.roomId))
      .where(and(inArray(roomMembers.userId, userIds), ne(rooms.status, 'CLOSED')))
      .groupBy(roomMembers.userId);
    return new Map(rows.map((row) => [row.userId, row.total]));
  }
  listMembers(roomId: string): Promise<RoomMemberDetail[]> {
    return this.db
      .select({
        userId: roomMembers.userId,
        displayName: users.displayName,
        memberRole: roomMembers.memberRole,
        lastReadAt: roomMembers.lastReadAt,
        email: users.email,
        status: users.status,
        suspendedUntil: users.suspendedUntil,
      })
      .from(roomMembers)
      .innerJoin(users, eq(users.id, roomMembers.userId))
      .where(eq(roomMembers.roomId, roomId))
      .orderBy(roomMembers.joinedAt);
  }

  async markRead(roomId: string, userId: string): Promise<Date | null> {
    const [row] = await this.db
      .update(roomMembers)
      .set({ lastReadAt: sql`now()` })
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)))
      .returning({ lastReadAt: roomMembers.lastReadAt });
    return row?.lastReadAt ?? null;
  }

  async updateStatus(
    roomId: string,
    status: RoomStatus,
    onlyFrom?: RoomStatus,
  ): Promise<Room | null> {
    const [row] = await this.db
      .update(rooms)
      .set({ status })
      .where(and(eq(rooms.id, roomId), onlyFrom ? eq(rooms.status, onlyFrom) : undefined))
      .returning(ROOM_COLUMNS);
    return row ?? null;
  }

  async escalateWithReport(roomId: string, report: NewModerationEvent): Promise<Room | null> {
    return this.db.transaction(async (tx) => {
      const [room] = await tx
        .update(rooms)
        .set({ status: 'ESCALATED' })
        .where(and(eq(rooms.id, roomId), ne(rooms.status, 'CLOSED')))
        .returning(ROOM_COLUMNS);
      if (!room) {
        return null;
      }
      await this.moderationEventsRepository.append(report, tx);
      return room;
    });
  }
}
