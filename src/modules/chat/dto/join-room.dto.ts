//WebSocket’ten gelen verinin kuralları.
//HTTP’deki DTO’larla aynı mantık: kurallara uymayan veri kodun içine hiç ulaşmaz.
import { IsUUID } from 'class-validator';

export class JoinRoomDto {
  @IsUUID()
  roomId!: string;
}
