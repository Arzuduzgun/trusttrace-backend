import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { User } from '../users/types/users.types';
import { AddMemberDto } from './dto/add-member.dto';
import { ReplaceAgentDto } from './dto/replace-agent.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { RoomsService } from './rooms.service';
import { RoomStatusService } from './room-status.service';
import { RoomAgentsService } from './room-agents.service';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto';

@ApiTags('Admin – Rooms')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/rooms')
export class AdminRoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly roomStatusService: RoomStatusService,
    private readonly roomAgentsService: RoomAgentsService,
  ) {}

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

  @Post(':id/agents/:agentId/replace')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  replaceAgent(
    @Param('id', ParseUUIDPipe) roomId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Body() dto: ReplaceAgentDto,
  ): Promise<void> {
    return this.roomAgentsService.replaceAgent(roomId, agentId, dto.newAgentId);
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(RoomResponseDto)
  async setStatus(
    @Param('id', ParseUUIDPipe) roomId: string,
    @Body() dto: UpdateRoomStatusDto,
  ): Promise<RoomResponseDto> {
    return RoomResponseDto.from(await this.roomStatusService.setStatus(roomId, dto.status));
  }
}
