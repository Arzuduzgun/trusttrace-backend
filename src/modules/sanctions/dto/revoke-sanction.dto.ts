import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { REVOKE_REASON_CODES } from '../sanction-reasons';
import type { RevokeReasonCode } from '../types/sanctions.types';

export class RevokeSanctionDto {
  @ApiProperty({ enum: REVOKE_REASON_CODES, enumName: 'RevokeReasonCode' })
  @IsIn(REVOKE_REASON_CODES)
  reasonCode!: RevokeReasonCode;

  @ApiProperty({ required: false, description: 'reasonCode OTHER ise zorunlu.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @ValidateIf((dto: RevokeSanctionDto) => dto.reasonCode === 'OTHER' || dto.note !== undefined)
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  note?: string;
}
