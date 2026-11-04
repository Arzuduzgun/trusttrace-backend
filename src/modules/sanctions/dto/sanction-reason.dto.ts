import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { SANCTION_REASON_CODES } from '../sanction-reasons';
import type { SanctionReasonCode } from '../types/sanctions.types';

export class SanctionReasonDto {
  @ApiProperty({ enum: SANCTION_REASON_CODES, enumName: 'SanctionReasonCode' })
  @IsIn(SANCTION_REASON_CODES)
  reasonCode!: SanctionReasonCode;

  @ApiProperty({ required: false, description: 'reasonCode OTHER ise zorunlu.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @ValidateIf((dto: SanctionReasonDto) => dto.reasonCode === 'OTHER' || dto.note !== undefined)
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  note?: string;
}
