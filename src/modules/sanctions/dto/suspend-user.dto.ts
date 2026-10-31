import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { SanctionReasonDto } from './sanction-reason.dto';

export class SuspendUserDto extends SanctionReasonDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(720)
  durationHours?: number;
}
