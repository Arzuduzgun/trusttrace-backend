import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { User } from '../users/users.types';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { RoomsService } from './rooms.service';

@ApiTags('Admin – Rooms')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/rooms')
export class AdminRoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiEnvelope(RoomResponseDto, { status: 201 })
  async create(@Body() dto: CreateRoomDto, @CurrentUser() admin: User): Promise<RoomResponseDto> {
    return RoomResponseDto.from(await this.roomsService.createProductRoom(dto.name, admin));
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  addMember(@Param('id', ParseUUIDPipe) roomId: string, @Body() dto: AddMemberDto): Promise<void> {
    return this.roomsService.addMember(roomId, dto.userId);
  }
}
