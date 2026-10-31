import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';
import type { User } from '../users/users.types';
import { SanctionReasonDto } from './dto/sanction-reason.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { SanctionsService } from './sanctions.service';

@Roles('ADMIN')
@Controller('admin/users/:id')
export class AdminSanctionsController {
  constructor(private readonly sanctionsService: SanctionsService) {}

  //POST /admin/users/:id/suspend: Askıya al.
  @Post('suspend')
  @HttpCode(HttpStatus.OK)
  async suspend(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: SuspendUserDto,
    @CurrentUser() admin: User,
  ): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.sanctionsService.suspend(userId, admin, dto));
  }

  //POST /admin/users/:id/ban: Banla.
  @Post('ban')
  @HttpCode(HttpStatus.OK)
  async ban(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: SanctionReasonDto,
    @CurrentUser() admin: User,
  ): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.sanctionsService.ban(userId, admin, dto));
  }

  //POST /admin/users/:id/sanctions/:eventId/revoke: Cezayı kaldır.
  @Post('sanctions/:eventId/revoke')
  @HttpCode(HttpStatus.OK)
  async revoke(
    @Param('id', ParseUUIDPipe) userId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: SanctionReasonDto,
    @CurrentUser() admin: User,
  ): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.sanctionsService.revoke(userId, eventId, admin, dto));
  }
}