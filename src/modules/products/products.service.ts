import { Injectable } from '@nestjs/common';
import type { User } from '../users/types/users.types';
import type { CreateProductDto } from './dto/create-product.dto';
import { ProductsRepository } from './products.repository';
import type { ProductWithRoom } from './types/products.types';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  listCatalog(): Promise<ProductWithRoom[]> {
    return this.productsRepository.listWithRooms();
  }

  create(dto: CreateProductDto, admin: User): Promise<ProductWithRoom> {
    return this.productsRepository.createWithRoom(
      {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        priceCents: dto.priceCents,
        createdBy: admin.id,
      },
      `${dto.name} Destek`,
    );
  }
}
