import { ApiProperty } from '@nestjs/swagger';
import type { ChainBreakReason, ChainVerification } from '../types/moderation-events.types';

const CHAIN_BREAK_REASONS = ['PREV_HASH_MISMATCH', 'CONTENT_HASH_MISMATCH'] as const;

export class ChainVerificationDto {
  valid!: boolean;
  checkedCount!: number;
  @ApiProperty({ type: Number, nullable: true })
  brokenAtSeq!: number | null;
  @ApiProperty({ enum: CHAIN_BREAK_REASONS, enumName: 'ChainBreakReason', nullable: true })
  reason!: ChainBreakReason | null;
  @ApiProperty({ type: String, nullable: true })
  headHash!: string | null;
  verifiedAt!: Date;

  static from(result: ChainVerification): ChainVerificationDto {
    return { ...result };
  }
}
