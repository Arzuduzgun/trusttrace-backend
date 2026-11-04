import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';
import type { User } from '../users/types/users.types';
import { SanctionReasonDto } from './dto/sanction-reason.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { SanctionsService } from './sanctions.service';
import { RevokeSanctionDto } from './dto/revoke-sanction.dto';

@ApiTags('Admin – Sanctions')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/users/:id')
export class AdminSanctionsController {
  constructor(private readonly sanctionsService: SanctionsService) {}

  @Post('suspend')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(UserResponseDto)
  async suspend(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: SuspendUserDto,
    @CurrentUser() admin: User,
  ): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.sanctionsService.suspend(userId, admin, dto));
  }

  @Post('ban')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(UserResponseDto)
  async ban(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: SanctionReasonDto,
    @CurrentUser() admin: User,
  ): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.sanctionsService.ban(userId, admin, dto));
  }

  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(UserResponseDto)
  async revoke(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: RevokeSanctionDto,
    @CurrentUser() admin: User,
  ): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.sanctionsService.revoke(userId, admin, dto));
  }
}
