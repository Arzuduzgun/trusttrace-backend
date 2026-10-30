//Müşteri ve temsilcinin kullandığı oda adreslerini açar. İş kuralı yok; servisi çağırıp sonucu DTO’ya çevirir.
import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { User } from '../users/users.types';
import { RoomResponseDto } from './dto/room-response.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}
  //Benim odalarım. Giriş yapmış herkes kullanabilir
  @Get()
  async listMine(@CurrentUser() user: User): Promise<RoomResponseDto[]> {
    const rooms = await this.roomsService.listMyRooms(user);
    return rooms.map((room) => RoomResponseDto.from(room));
  }
  //Katılınabilecek ürün odaları.
  @Get('product')
  async listProductRooms(): Promise<RoomResponseDto[]> {
    const rooms = await this.roomsService.listProductRooms();
    return rooms.map((room) => RoomResponseDto.from(room));
  }
  //1-1 destek başlat. Sadece müşteri. 201 döner.
  @Post('direct')
  @Roles('CUSTOMER')
  async startDirect(@CurrentUser() user: User): Promise<RoomResponseDto> {
    return RoomResponseDto.from(await this.roomsService.startDirectRoom(user));
  }
  //Ürün odasına katıl. Sadece müşteri.
  @Post(':id/join')
  @Roles('CUSTOMER')
  @HttpCode(HttpStatus.OK)
  async join(
    @Param('id', ParseUUIDPipe) roomId: string,
    @CurrentUser() user: User,
  ): Promise<RoomResponseDto> {
    return RoomResponseDto.from(await this.roomsService.joinProductRoom(roomId, user));
  }
}
