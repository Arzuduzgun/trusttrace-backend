// JWT'nin içi herkes tarafından okunabilir: içine sadece id koyuyoruz, rol ya da e-posta değil.
import type { UserResponseDto } from '../users/dto/user-response.dto';

export interface AccessTokenPayload {
  sub: string;
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
}

export interface AuthResult extends TokenPair {
  user: UserResponseDto;
}

export interface NewRefreshToken {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface VerifiedAccessToken extends AccessTokenPayload {
  iat: number;
  exp: number;
}

export interface WsTicket {
  ticket: string;
  expiresIn: number;
}
