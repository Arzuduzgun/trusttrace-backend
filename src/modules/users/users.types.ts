//Uygulamanın geri kalanının gördüğü “kullanıcı” şekli.
import type { userRoleEnum, userStatusEnum } from '../../database/schema';

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserStatus = (typeof userStatusEnum.enumValues)[number];

//şifre hash’i içermez.
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  suspendedUntil: Date | null;
  tokensValidAfter: Date;
  createdAt: Date;
}

//kullanıcı ve hash’i birlikte tutar. Sadece giriş sırasında kullanılır.
export interface UserCredentials {
  user: User;
  passwordHash: string;
}

export interface NewUser {
  email: string;
  passwordHash: string;
  displayName: string;
  role?: UserRole;
}
