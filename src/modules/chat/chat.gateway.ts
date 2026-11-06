//WebSocket’in kapısı. Hatların açıldığı, mesajların geldiği ve dağıtıldığı yer.
import { Logger, UseFilters, UsePipes, ValidationPipe, OnModuleDestroy } from '@nestjs/common';
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
import type { User } from '../users/types/users.types';
import { CHAT_EVENTS, roomChannel, staffChannel, userChannel } from './chat.events';
import type { ChatSocketData } from './types/chat-socket.types';
import { JoinRoomDto } from './dto/join-room.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';
import { ChatNotifierService } from '../../realtime/chat-notifier.service';
import { DomainException } from '../../common/errors/domain.exception';
import { currentTraceId, withSpan } from '../../common/tracing/with-span';
import { PresenceService } from '../../redis/presence.service';

const PRESENCE_HEARTBEAT_MS = 20_000;

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
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer()
  private readonly server!: Namespace;

  private readonly logger = new Logger(ChatGateway.name);
  private heartbeat: NodeJS.Timeout | null = null;

  constructor(
    private readonly wsTicketService: WsTicketService,
    private readonly usersService: UsersService,
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService,
    private readonly chatNotifier: ChatNotifierService,
    private readonly presence: PresenceService,
  ) {}
  // “kontrol etmeden açma” mantığı burada
  afterInit(server: Namespace): void {
    this.chatNotifier.attach(server);
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
    this.heartbeat = setInterval(() => void this.refreshPresence(), PRESENCE_HEARTBEAT_MS);
  }

  async handleConnection(client: Socket): Promise<void> {
    const user = this.userOf(client);
    this.logger.log(`Socket connected: user=${user.id} socket=${client.id}`);
    await this.presence
      .connect(user.id, client.id)
      .catch((error: unknown) => this.logger.warn(`Presence connect failed: ${String(error)}`));
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const user = this.userOf(client);
    this.logger.log(`Socket disconnected: user=${user.id} socket=${client.id}`);
    await this.presence
      .disconnect(user.id, client.id)
      .catch((error: unknown) => this.logger.warn(`Presence disconnect failed: ${String(error)}`));
  }

  onModuleDestroy(): void {
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
    }
  }

  private async refreshPresence(): Promise<void> {
    const userIds = [...this.server.sockets.values()].map((socket) => this.userOf(socket).id);
    await this.presence
      .refresh(userIds)
      .catch((error: unknown) => this.logger.warn(`Presence refresh failed: ${String(error)}`));
  }

  @SubscribeMessage(CHAT_EVENTS.JOIN_ROOM)
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinRoomDto,
  ): Promise<WsSuccess<{ roomId: string }>> {
    const user = this.userOf(client);
    await this.roomsService.assertCanAccess(dto.roomId, user);
    await client.join(roomChannel(dto.roomId));
    if (user.role !== 'CUSTOMER') {
      await client.join(staffChannel(dto.roomId));
    }
    return { ok: true, data: { roomId: dto.roomId } };
  }

  @SubscribeMessage(CHAT_EVENTS.LEAVE_ROOM)
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinRoomDto,
  ): Promise<WsSuccess<{ roomId: string }>> {
    await client.leave(roomChannel(dto.roomId));
    await client.leave(staffChannel(dto.roomId));
    return { ok: true, data: { roomId: dto.roomId } };
  }

  @SubscribeMessage(CHAT_EVENTS.MARK_READ)
  async markRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinRoomDto,
  ): Promise<WsSuccess<{ roomId: string }>> {
    const user = this.userOf(client);
    const lastReadAt = await this.roomsService.markRead(dto.roomId, user);
    if (lastReadAt && user.role === 'CUSTOMER') {
      this.server.to(staffChannel(dto.roomId)).emit(CHAT_EVENTS.READ_UPDATED, {
        roomId: dto.roomId,
        userId: user.id,
        lastReadAt,
      });
    }
    return { ok: true, data: { roomId: dto.roomId } };
  }

  @SubscribeMessage(CHAT_EVENTS.SEND_MESSAGE)
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ): Promise<WsSuccess<MessageResponseDto>> {
    const sender = this.userOf(client);
    const attributes = {
      'room.id': dto.roomId,
      'user.id': sender.id,
      'message.client_id': dto.clientMessageId,
    };
    return withSpan<WsSuccess<MessageResponseDto>>('chat.message', attributes, async () => {
      try {
        const message = await this.messagesService.send(
          dto.roomId,
          sender,
          dto.body,
          dto.clientMessageId,
        );
        if (message.status === 'DELIVERED' || message.status === 'FLAGGED') {
          await withSpan('message.broadcast', { 'message.id': message.id }, () =>
            this.server.to(roomChannel(dto.roomId)).emit(CHAT_EVENTS.NEW_MESSAGE, message),
          );
        }
        return { ok: true, data: message };
      } catch (error) {
        this.server.to(userChannel(sender.id)).emit(CHAT_EVENTS.MESSAGE_FAILED, {
          roomId: dto.roomId,
          clientMessageId: dto.clientMessageId,
          reason: error instanceof DomainException ? error.message : 'Mesaj gönderilemedi.',
          traceId: currentTraceId(),
        });
        throw error;
      }
    });
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
