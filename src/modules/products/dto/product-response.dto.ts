import { ApiProperty } from '@nestjs/swagger';
import { roomStatusEnum } from '../../../database/schema';
import type { RoomStatus } from '../../rooms/types/rooms.types';
import type { ProductWithRoom } from '../types/products.types';

export class ProductResponseDto {
  id!: string;
  name!: string;
  description!: string;
  imageUrl!: string;
  priceCents!: number;
  roomId!: string | null;
  @ApiProperty({ enum: roomStatusEnum.enumValues, enumName: 'RoomStatus', nullable: true })
  roomStatus!: RoomStatus | null;
  createdAt!: Date;

  static from(product: ProductWithRoom): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      priceCents: product.priceCents,
      roomId: product.roomId,
      roomStatus: product.roomStatus,
      createdAt: product.createdAt,
    };
  }
}
