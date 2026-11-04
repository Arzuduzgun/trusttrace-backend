import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DomainException } from '../../common/errors/domain.exception';
import { AppConfigService } from '../../config/app-config.service';
import { AUTH_ERRORS } from './auth.errors';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import type {
  AccessTokenPayload,
  NewRefreshToken,
  RefreshTokenRecord,
  RotationResult,
  TokenPair,
} from './types/auth.types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const REUSE_GRACE_MS = 10_000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async issueForNewSession(userId: string): Promise<TokenPair> {
    const familyId = randomUUID();
    const refresh = this.createRefreshToken(userId, familyId);
    await this.refreshTokensRepository.create(refresh.record);
    return this.buildPair(userId, familyId, refresh.token);
  }

  async rotate(refreshToken: string): Promise<RotationResult> {
    const record = await this.refreshTokensRepository.findByHash(hashToken(refreshToken));
    if (!record) {
      throw new DomainException(AUTH_ERRORS.AUTH_REFRESH_INVALID);
    }
    if (record.revokedAt) {
      if (this.isConcurrentRotation(record)) {
        return this.issueInFamily(record);
      }
      await this.refreshTokensRepository.revokeFamily(record.familyId);
      throw new DomainException(AUTH_ERRORS.AUTH_REFRESH_REUSED);
    }
    if (record.expiresAt <= new Date()) {
      throw new DomainException(AUTH_ERRORS.AUTH_REFRESH_EXPIRED);
    }
    const next = this.createRefreshToken(record.userId, record.familyId);
    const rotated = await this.refreshTokensRepository.rotate(record.id, next.record);
    if (!rotated) {
      return this.issueInFamily(record);
    }
    return {
      userId: record.userId,
      pair: await this.buildPair(record.userId, record.familyId, next.token),
    };
  }

  async revokeSession(refreshToken: string): Promise<void> {
    const record = await this.refreshTokensRepository.findByHash(hashToken(refreshToken));
    if (record) {
      await this.refreshTokensRepository.revokeFamily(record.familyId);
    }
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.refreshTokensRepository.revokeAllForUser(userId);
  }

  isSessionActive(sessionId: string): Promise<boolean> {
    return this.refreshTokensRepository.isFamilyActive(sessionId);
  }

  private isConcurrentRotation(record: RefreshTokenRecord): boolean {
    return (
      record.replacedById !== null &&
      record.revokedAt !== null &&
      Date.now() - record.revokedAt.getTime() < REUSE_GRACE_MS
    );
  }

  private async issueInFamily(record: RefreshTokenRecord): Promise<RotationResult> {
    if (!(await this.refreshTokensRepository.isFamilyActive(record.familyId))) {
      throw new DomainException(AUTH_ERRORS.AUTH_REFRESH_REUSED);
    }
    const next = this.createRefreshToken(record.userId, record.familyId);
    await this.refreshTokensRepository.create(next.record);
    return {
      userId: record.userId,
      pair: await this.buildPair(record.userId, record.familyId, next.token),
    };
  }

  private async buildPair(
    userId: string,
    familyId: string,
    refreshToken: string,
  ): Promise<TokenPair> {
    const expiresIn = this.config.get('JWT_ACCESS_TTL_SECONDS');
    const payload: AccessTokenPayload = { sub: userId, sid: familyId, jti: randomUUID() };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn,
    });
    return { accessToken, accessTokenExpiresIn: expiresIn, refreshToken };
  }

  private createRefreshToken(
    userId: string,
    familyId: string,
  ): { token: string; record: NewRefreshToken } {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.config.get('JWT_REFRESH_TTL_DAYS') * DAY_IN_MS);
    return { token, record: { userId, familyId, tokenHash: hashToken(token), expiresAt } };
  }
}
