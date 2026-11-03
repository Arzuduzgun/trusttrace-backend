import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { userStatusEnum } from '../../../database/schema';
import type { UserStatus } from '../users.types';
import { ApiProperty } from '@nestjs/swagger';

export class UserQueryDto {
  @IsOptional()
  @IsIn(userStatusEnum.enumValues)
  @ApiProperty({ enum: userStatusEnum.enumValues, enumName: 'UserStatus', required: false })
  status?: UserStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
