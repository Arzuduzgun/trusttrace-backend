import { ApiProperty } from '@nestjs/swagger';
import { memberRoleEnum, userStatusEnum } from '../../../database/schema';
import type { MemberRole, RoomMemberView } from '../types/rooms.types';
import { UserStatus } from '../../users/types/users.types';

export class RoomMemberResponseDto {
  userId!: string;
  displayName!: string;
  @ApiProperty({ enum: memberRoleEnum.enumValues, enumName: 'MemberRole' })
  memberRole!: MemberRole;
  isOnline!: boolean;
  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'İsteyen müşteriyse her zaman null.',
  })
  lastReadAt!: Date | null;
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Sadece temsilci ve yöneticiye döner.',
  })
  email!: string | null;
  @ApiProperty({ enum: userStatusEnum.enumValues, enumName: 'UserStatus', nullable: true })
  status!: UserStatus | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  suspendedUntil!: Date | null;

  static from(member: RoomMemberView): RoomMemberResponseDto {
    return {
      userId: member.userId,
      displayName: member.displayName,
      memberRole: member.memberRole,
      isOnline: member.isOnline,
      lastReadAt: member.lastReadAt,
      email: member.email,
      status: member.status,
      suspendedUntil: member.suspendedUntil,
    };
  }
}
