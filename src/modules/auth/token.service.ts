// Token üretir, yeniler, iptal eder. Refresh token rastgele 32 bayt; DB'de SHA-256 hash'i tutulur.
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DomainException } from '../../common/errors/domain.exception';
import { AppConfigService } from '../../config/app-config.service';
import { AUTH_ERRORS } from './auth.errors';
import type { AccessTokenPayload, NewRefreshToken, TokenPair } from './auth.types';
import { RefreshTokensRepository } from './refresh-tokens.repository';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

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

  // Yeni giriş: yeni bir token ailesi başlatır.
  async issueForNewSession(userId: string): Promise<TokenPair> {
    const refresh = this.createRefreshToken(userId, randomUUID());
    await this.refreshTokensRepository.create(refresh.record);
    return this.buildPair(userId, refresh.token);
  }

  // Rotation: eski token ölür, aynı aileden yenisi doğar. Ölmüş token tekrar gelirse bütün aile iptal. */
  async rotate(refreshToken: string): Promise<{ userId: string; pair: TokenPair }> {
    const record = await this.refreshTokensRepository.findByHash(hashToken(refreshToken));
    if (!record) {
      throw new DomainException(AUTH_ERRORS.AUTH_REFRESH_INVALID);
    }
    if (record.revokedAt) {
      await this.refreshTokensRepository.revokeFamily(record.familyId);
      throw new DomainException(AUTH_ERRORS.AUTH_REFRESH_REUSED);
    }
    if (record.expiresAt <= new Date()) {
      throw new DomainException(AUTH_ERRORS.AUTH_REFRESH_EXPIRED);
    }
    const next = this.createRefreshToken(record.userId, record.familyId);
    const rotated = await this.refreshTokensRepository.rotate(record.id, next.record);
    if (!rotated) {
      await this.refreshTokensRepository.revokeFamily(record.familyId);
      throw new DomainException(AUTH_ERRORS.AUTH_REFRESH_REUSED);
    }
    return { userId: record.userId, pair: await this.buildPair(record.userId, next.token) };
  }

  // Logout: bu oturumun bütün refresh token'larını iptal eder. Bilinmeyen token sessizce yok sayılır. */
  async revokeSession(refreshToken: string): Promise<void> {
    const record = await this.refreshTokensRepository.findByHash(hashToken(refreshToken));
    if (record) {
      await this.refreshTokensRepository.revokeFamily(record.familyId);
    }
  }

  private async buildPair(userId: string, refreshToken: string): Promise<TokenPair> {
    const expiresIn = this.config.get('JWT_ACCESS_TTL_SECONDS');
    const payload: AccessTokenPayload = { sub: userId, jti: randomUUID() };
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
