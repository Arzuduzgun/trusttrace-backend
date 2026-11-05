import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiEnvelope(ProductResponseDto, { isArray: true })
  async list(): Promise<ProductResponseDto[]> {
    const products = await this.productsService.listCatalog();
    return products.map((product) => ProductResponseDto.from(product));
  }
}
