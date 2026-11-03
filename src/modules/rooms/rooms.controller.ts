import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { User } from '../users/users.types';
import { RoomResponseDto } from './dto/room-response.dto';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiEnvelope(RoomResponseDto, { isArray: true })
  async listMine(@CurrentUser() user: User): Promise<RoomResponseDto[]> {
    const rooms = await this.roomsService.listMyRooms(user);
    return rooms.map((room) => RoomResponseDto.from(room));
  }

  @Get('product')
  @ApiEnvelope(RoomResponseDto, { isArray: true })
  async listProductRooms(): Promise<RoomResponseDto[]> {
    const rooms = await this.roomsService.listProductRooms();
    return rooms.map((room) => RoomResponseDto.from(room));
  }

  @Post('direct')
  @Roles('CUSTOMER')
  @ApiEnvelope(RoomResponseDto, { status: 201 })
  async startDirect(@CurrentUser() user: User): Promise<RoomResponseDto> {
    return RoomResponseDto.from(await this.roomsService.startDirectRoom(user));
  }

  @Post(':id/join')
  @Roles('CUSTOMER')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(RoomResponseDto)
  async join(
    @Param('id', ParseUUIDPipe) roomId: string,
    @CurrentUser() user: User,
  ): Promise<RoomResponseDto> {
    return RoomResponseDto.from(await this.roomsService.joinProductRoom(roomId, user));
  }
}
