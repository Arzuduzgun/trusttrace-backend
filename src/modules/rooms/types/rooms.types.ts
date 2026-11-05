import type { memberRoleEnum, roomStatusEnum, roomTypeEnum } from '../../../database/schema';
import { UserStatus } from '../../users/types/users.types';

export type RoomType = (typeof roomTypeEnum.enumValues)[number];
export type RoomStatus = (typeof roomStatusEnum.enumValues)[number];
export type MemberRole = (typeof memberRoleEnum.enumValues)[number];

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  status: RoomStatus;
  createdAt: Date;
  productId: string | null;
}

export interface NewRoom {
  type: RoomType;
  name: string;
  createdBy: string;
}

export interface NewRoomMember {
  userId: string;
  memberRole: MemberRole;
}

export interface RoomMemberDetail {
  userId: string;
  displayName: string;
  memberRole: MemberRole;
  lastReadAt: Date | null;
  email: string;
  status: UserStatus;
  suspendedUntil: Date | null;
}

export interface RoomMemberView {
  userId: string;
  displayName: string;
  memberRole: MemberRole;
  isOnline: boolean;
  lastReadAt: Date | null;
  email: string | null;
  status: UserStatus | null;
  suspendedUntil: Date | null;
}
