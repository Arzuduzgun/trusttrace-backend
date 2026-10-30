//Odanın uygulama içindeki şeklini tanımlar.
import type { memberRoleEnum, roomStatusEnum, roomTypeEnum } from '../../database/schema';

export type RoomType = (typeof roomTypeEnum.enumValues)[number];
export type RoomStatus = (typeof roomStatusEnum.enumValues)[number];
export type MemberRole = (typeof memberRoleEnum.enumValues)[number];

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  status: RoomStatus;
  createdAt: Date;
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
