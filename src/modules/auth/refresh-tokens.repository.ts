// refresh_tokens tablosunun SQL'i. rotate() tek transaction: aynı token iki kez kullanılamaz.
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';
import { refreshTokens } from '../../database/schema';
import type { NewRefreshToken, RefreshTokenRecord } from './auth.types';

@Injectable()
export class RefreshTokensRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(token: NewRefreshToken): Promise<void> {
    await this.db.insert(refreshTokens).values(token);
  }

  async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const [row] = await this.db
      .select({
        id: refreshTokens.id,
        userId: refreshTokens.userId,
        familyId: refreshTokens.familyId,
        expiresAt: refreshTokens.expiresAt,
        revokedAt: refreshTokens.revokedAt,
      })
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);
    return row ?? null;
  }

  //Eskiyi iptal et + yenisini ekle. Eski token o anda başka bir istekle kullanıldıysa false döner.
  async rotate(oldTokenId: string, next: NewRefreshToken): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const [revoked] = await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(and(eq(refreshTokens.id, oldTokenId), isNull(refreshTokens.revokedAt)))
        .returning({ id: refreshTokens.id });
      if (!revoked) {
        return false;
      }
      const [created] = await tx
        .insert(refreshTokens)
        .values(next)
        .returning({ id: refreshTokens.id });
      if (!created) {
        throw new Error('Refresh token insert returned no row');
      }
      await tx
        .update(refreshTokens)
        .set({ replacedById: created.id })
        .where(eq(refreshTokens.id, oldTokenId));
      return true;
    });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.familyId, familyId), isNull(refreshTokens.revokedAt)));
  }
}
