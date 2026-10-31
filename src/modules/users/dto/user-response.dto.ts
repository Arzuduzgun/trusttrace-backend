// Kullanıcının dışarıya gösterilen hali. İç alanlar (hash, tokensValidAfter) burada yok.
import type { User, UserRole, UserStatus } from '../users.types';

export class UserResponseDto {
  id!: string;
  email!: string;
  displayName!: string;
  role!: UserRole;
  status!: UserStatus;
  suspendedUntil!: Date | null;

  static from(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      suspendedUntil: user.suspendedUntil,
    };
  }
}
