import { ApiProperty } from '@nestjs/swagger';
import { memberRoleEnum } from '../../../database/schema';
import type { MemberRole, RoomMemberView } from '../types/rooms.types';

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

  static from(member: RoomMemberView): RoomMemberResponseDto {
    return {
      userId: member.userId,
      displayName: member.displayName,
      memberRole: member.memberRole,
      isOnline: member.isOnline,
      lastReadAt: member.lastReadAt,
    };
  }
}
