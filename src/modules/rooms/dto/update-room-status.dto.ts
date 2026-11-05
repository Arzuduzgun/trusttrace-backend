import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { roomStatusEnum } from '../../../database/schema';
import type { RoomStatus } from '../types/rooms.types';

export class UpdateRoomStatusDto {
  @ApiProperty({ enum: roomStatusEnum.enumValues, enumName: 'RoomStatus' })
  @IsIn(roomStatusEnum.enumValues)
  status!: RoomStatus;
}
