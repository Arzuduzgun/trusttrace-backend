//Odanın dışarıya gösterilen hali. from fonksiyonu iç nesneyi bu şekle çevirir.
import type { Room, RoomStatus, RoomType } from '../rooms.types';

export class RoomResponseDto {
  id!: string;
  type!: RoomType;
  name!: string;
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
