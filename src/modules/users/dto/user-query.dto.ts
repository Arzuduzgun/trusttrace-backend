//Admin kullanıcı listesinin filtrelerini doğrular
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { userStatusEnum } from '../../../database/schema';
import type { UserStatus } from '../users.types';

export class UserQueryDto {
  @IsOptional()
  @IsIn(userStatusEnum.enumValues)
  status?: UserStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
