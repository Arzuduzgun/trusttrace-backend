import { Transform } from 'class-transformer';
import { IsInt, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

const IMAGE_URL_PATTERN = /^(\/products\/[\w.-]+\.(jpg|jpeg|png|webp)|https:\/\/\S+)$/i;
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateProductDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsString()
  @MaxLength(500)
  @Matches(IMAGE_URL_PATTERN, { message: 'imageUrl must be /products/<file> or an https URL' })
  imageUrl!: string;

  @IsInt()
  @Min(0)
  @Max(100_000_000)
  priceCents!: number;
}
