//Users tablosunun bütün SQL’i burada.
import { Inject, Injectable } from '@nestjs/common';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { DomainException } from '../../common/errors/domain.exception';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';
import { isUniqueViolation } from '../../database/postgres-errors';
import { users } from '../../database/schema';
import { USER_ERRORS } from './users.errors';
import type {
  NewUser,
  User,
  UserCredentials,
  UserListFilter,
  UserRole,
  UserStatusChange,
} from './users.types';
import { ModerationEventsRepository } from '../moderation-events/moderation-events.repository';
import { NewModerationEvent } from '../moderation-events/moderation-events.types';

//Hangi kolonların okunacağı. passwordHash bu listede yok, yani hash normal sorgularla hiç okunmaz.
const USER_COLUMNS = {
  id: users.id,
  email: users.email,
  displayName: users.displayName,
  role: users.role,
  status: users.status,
  suspendedUntil: users.suspendedUntil,
  tokensValidAfter: users.tokensValidAfter,
  createdAt: users.createdAt,
};

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly moderationEventsRepository: ModerationEventsRepository,
  ) {}

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select(USER_COLUMNS).from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }

  //Hash’i okuyan tek metot. Sadece giriş için.
  async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    const [row] = await this.db
      .select({ ...USER_COLUMNS, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!row) {
      return null;
    }
    const { passwordHash, ...user } = row;
    return { user, passwordHash };
  }

  async create(newUser: NewUser): Promise<User> {
    try {
      const [row] = await this.db.insert(users).values(newUser).returning(USER_COLUMNS);
      if (!row) {
        throw new Error('User insert returned no row');
      }
      return row;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DomainException(USER_ERRORS.USER_EMAIL_ALREADY_EXISTS);
      }
      throw error;
    }
  }

  //Verilen roldeki aktif kullanıcıları getirir.
  async listActiveByRole(role: UserRole): Promise<User[]> {
    return this.db
      .select(USER_COLUMNS)
      .from(users)
      .where(and(eq(users.role, role), eq(users.status, 'ACTIVE')));
  }
  //Mesaj listesinde “kim yazdı” adıyla görünmeli.Verilen id’lerin isimlerini tek sorguda getirir.
  async findDisplayNames(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) {
      return new Map();
    }
    const rows = await this.db
      .select({ id: users.id, displayName: users.displayName })
      .from(users)
      .where(inArray(users.id, ids));
    return new Map(rows.map((row) => [row.id, row.displayName]));
  }

  list(filter: UserListFilter): Promise<User[]> {
    return this.db
      .select(USER_COLUMNS)
      .from(users)
      .where(filter.status ? eq(users.status, filter.status) : undefined)
      .orderBy(desc(users.createdAt))
      .limit(filter.limit);
  }

  //Kullanıcının durumunu değiştirir ve defter kaydını aynı transaction’da yazar.
  async updateStatusWithEvent(
    userId: string,
    change: UserStatusChange,
    event: NewModerationEvent,
  ): Promise<User> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .update(users)
        .set(change)
        .where(eq(users.id, userId))
        .returning(USER_COLUMNS);
      if (!row) {
        throw new DomainException(USER_ERRORS.USER_NOT_FOUND);
      }
      await this.moderationEventsRepository.append(event, tx);
      return row;
    });
  }
}
