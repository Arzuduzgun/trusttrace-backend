//Admin’in oda yönetimi adresleri. Sınıfın üstündeki @Roles('ADMIN'), içindeki bütün adreslere uygulanır.
import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { User } from '../users/users.types';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { RoomsService } from './rooms.service';

@Roles('ADMIN')
@Controller('admin/rooms')
export class AdminRoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  //Ürün odası aç. 201 döner.
  @Post()
  async create(@Body() dto: CreateRoomDto, @CurrentUser() admin: User): Promise<RoomResponseDto> {
    return RoomResponseDto.from(await this.roomsService.createProductRoom(dto.name, admin));
  }

  //Odaya kişi ekle. 204 döner, çünkü dönecek bir içerik yok.
  @Post(':id/members')
  @HttpCode(HttpStatus.NO_CONTENT)
  addMember(@Param('id', ParseUUIDPipe) roomId: string, @Body() dto: AddMemberDto): Promise<void> {
    return this.roomsService.addMember(roomId, dto.userId);
  }
}
