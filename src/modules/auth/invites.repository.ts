import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { DomainException } from '../../common/errors/domain.exception';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';
import { agentInvites, users } from '../../database/schema';
import { AUTH_ERRORS } from './auth.errors';
import type { ValidInvite } from './types/invites.types';

@Injectable()
export class InvitesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async replaceForUser(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(agentInvites)
        .set({ usedAt: sql`now()` })
        .where(and(eq(agentInvites.userId, userId), isNull(agentInvites.usedAt)));
      await tx.insert(agentInvites).values({ userId, tokenHash, expiresAt });
    });
  }

  async findValid(tokenHash: string): Promise<ValidInvite | null> {
    const [row] = await this.db
      .select({
        inviteId: agentInvites.id,
        userId: users.id,
        email: users.email,
        displayName: users.displayName,
        expiresAt: agentInvites.expiresAt,
      })
      .from(agentInvites)
      .innerJoin(users, eq(users.id, agentInvites.userId))
      .where(
        and(
          eq(agentInvites.tokenHash, tokenHash),
          isNull(agentInvites.usedAt),
          gt(agentInvites.expiresAt, sql`now()`),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async accept(inviteId: string, userId: string, passwordHash: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const used = await tx
        .update(agentInvites)
        .set({ usedAt: sql`now()` })
        .where(and(eq(agentInvites.id, inviteId), isNull(agentInvites.usedAt)))
        .returning({ id: agentInvites.id });
      if (used.length === 0) {
        throw new DomainException(AUTH_ERRORS.AUTH_INVITE_INVALID);
      }
      await tx
        .update(users)
        .set({ passwordHash, tokensValidAfter: sql`now()` })
        .where(eq(users.id, userId));
    });
  }
}
