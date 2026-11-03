import { ApiProperty } from '@nestjs/swagger';
import { roomStatusEnum, roomTypeEnum } from '../../../database/schema';
import type { Room, RoomStatus, RoomType } from '../types/rooms.types';

export class RoomResponseDto {
  id!: string;
  @ApiProperty({ enum: roomTypeEnum.enumValues, enumName: 'RoomType' })
  type!: RoomType;
  name!: string;
  @ApiProperty({ enum: roomStatusEnum.enumValues, enumName: 'RoomStatus' })
  status!: RoomStatus;
  createdAt!: Date;

  static from(room: Room): RoomResponseDto {
    return {
      id: room.id,
      type: room.type,
      name: room.name,
      status: room.status,
      createdAt: room.createdAt,
    };
  }
}
