import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.tokens';
import type { Database } from '../../database/database.types';
import { products, rooms } from '../../database/schema';
import type { NewProduct, ProductWithRoom } from './types/products.types';

const PRODUCT_COLUMNS = {
  id: products.id,
  name: products.name,
  description: products.description,
  imageUrl: products.imageUrl,
  priceCents: products.priceCents,
  createdAt: products.createdAt,
};

@Injectable()
export class ProductsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  listWithRooms(): Promise<ProductWithRoom[]> {
    return this.db
      .select({ ...PRODUCT_COLUMNS, roomId: rooms.id, roomStatus: rooms.status })
      .from(products)
      .leftJoin(rooms, eq(rooms.productId, products.id))
      .orderBy(asc(products.createdAt));
  }

  async createWithRoom(newProduct: NewProduct, roomName: string): Promise<ProductWithRoom> {
    return this.db.transaction(async (tx) => {
      const [product] = await tx.insert(products).values(newProduct).returning(PRODUCT_COLUMNS);
      if (!product) {
        throw new Error('Product insert returned no row');
      }
      const [room] = await tx
        .insert(rooms)
        .values({
          type: 'PRODUCT',
          name: roomName,
          createdBy: newProduct.createdBy,
          productId: product.id,
        })
        .returning({ id: rooms.id, status: rooms.status });
      if (!room) {
        throw new Error('Product room insert returned no row');
      }
      return { ...product, roomId: room.id, roomStatus: room.status };
    });
  }
}
