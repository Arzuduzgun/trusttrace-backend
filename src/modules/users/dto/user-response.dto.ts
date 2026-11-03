import { ApiProperty } from '@nestjs/swagger';
import { userRoleEnum, userStatusEnum } from '../../../database/schema';
import type { User, UserRole, UserStatus } from '../types/users.types';

export class UserResponseDto {
  id!: string;
  email!: string;
  displayName!: string;
  @ApiProperty({ enum: userRoleEnum.enumValues, enumName: 'UserRole' })
  role!: UserRole;
  @ApiProperty({ enum: userStatusEnum.enumValues, enumName: 'UserStatus' })
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
