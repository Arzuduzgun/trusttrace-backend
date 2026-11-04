import type { UserWithPresence } from '../types/users.types';
import { UserResponseDto } from './user-response.dto';

export class AdminUserResponseDto extends UserResponseDto {
  isOnline!: boolean;

  static fromAdmin(user: UserWithPresence): AdminUserResponseDto {
    return { ...UserResponseDto.from(user), isOnline: user.isOnline };
  }
}
