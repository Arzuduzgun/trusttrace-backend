//WebSocket’in kapısı. Hatların açıldığı, mesajların geldiği ve dağıtıldığı yer.
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { WsExceptionFilter } from '../../common/filters/ws-exception.filter';
import type { WsSuccess } from '../../common/types/ws-response.types';
import { validationExceptionFactory } from '../../common/validation/validation-exception.factory';
import { WsTicketService } from '../auth/ws-ticket.service';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import type { User } from '../users/users.types';
import { CHAT_EVENTS, roomChannel, userChannel, type ChatSocketData } from './chat.events';
import { JoinRoomDto } from './dto/join-room.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

//Gelen veriyi DTO kurallarına göre kontrol eder.
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: validationExceptionFactory,
  }),
)
@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: ['http://localhost:3000'], credentials: true },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Namespace;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly wsTicketService: WsTicketService,
    private readonly usersService: UsersService,
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService,
  ) {}
  // “kontrol etmeden açma” mantığı burada
  afterInit(server: Namespace): void {
    server.use(async (socket, next) => {
      try {
        await this.authenticate(socket);
        next();
      } catch (error) {
        this.logger.warn(
          `Socket rejected: ${error instanceof Error ? error.message : String(error)}`,
        );
        next(new Error('AUTH_TOKEN_INVALID'));
      }
    });
  }

  //Bağlantı açıldığında ve kapandığında kimin bağlandığını loglar.
  handleConnection(client: Socket): void {
    this.logger.log(`Socket connected: user=${this.userOf(client).id} socket=${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Socket disconnected: socket=${client.id}`);
  }

  @SubscribeMessage(CHAT_EVENTS.JOIN_ROOM)
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinRoomDto,
  ): Promise<WsSuccess<{ roomId: string }>> {
    await this.roomsService.assertCanAccess(dto.roomId, this.userOf(client));
    await client.join(roomChannel(dto.roomId));
    return { ok: true, data: { roomId: dto.roomId } };
  }

  @SubscribeMessage(CHAT_EVENTS.LEAVE_ROOM)
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinRoomDto,
  ): Promise<WsSuccess<{ roomId: string }>> {
    await client.leave(roomChannel(dto.roomId));
    return { ok: true, data: { roomId: dto.roomId } };
  }

  @SubscribeMessage(CHAT_EVENTS.SEND_MESSAGE)
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ): Promise<WsSuccess<MessageResponseDto>> {
    const message = await this.messagesService.send(
      dto.roomId,
      this.userOf(client),
      dto.body,
      dto.clientMessageId,
    );
    if (message.status !== 'BLOCKED') {
      this.server.to(roomChannel(dto.roomId)).emit(CHAT_EVENTS.NEW_MESSAGE, message);
    }
    return { ok: true, data: message };
  }

  private async authenticate(socket: Socket): Promise<void> {
    const fromAuth: unknown = socket.handshake.auth['ticket'];
    const fromHeader = socket.handshake.headers['x-ws-ticket'];
    const ticket = typeof fromAuth === 'string' ? fromAuth : fromHeader;
    if (typeof ticket !== 'string') {
      throw new Error('ticket missing');
    }
    const userId = await this.wsTicketService.verify(ticket);
    const user = await this.usersService.findById(userId);
    if (!user || user.status === 'BANNED') {
      throw new Error('user not active');
    }
    const data: ChatSocketData = { user };
    socket.data = data;
    await socket.join(userChannel(user.id));
  }

  private userOf(client: Socket): User {
    const data: ChatSocketData = client.data;
    return data.user;
  }
}
