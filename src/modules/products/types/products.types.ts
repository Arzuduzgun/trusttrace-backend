import type { RoomStatus } from '../../rooms/types/rooms.types';

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCents: number;
  createdAt: Date;
}

export interface NewProduct {
  name: string;
  description: string;
  imageUrl: string;
  priceCents: number;
  createdBy: string;
}

export interface ProductWithRoom extends Product {
  roomId: string | null;
  roomStatus: RoomStatus | null;
}
