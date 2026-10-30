import { Injectable } from '@nestjs/common';
import type { CursorQueryDto } from '../../common/dto/cursor-query.dto';
import { DomainException } from '../../common/errors/domain.exception';
import { decodeCursor, encodeCursor } from '../../common/pagination/cursor';
import type { Paginated } from '../../common/types/api-response.types';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import type { User } from '../users/users.types';
import { CHAT_ERRORS } from './chat.errors';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessagesRepository } from './messages.repository';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  async listHistory(
    roomId: string,
    viewer: User,
    query: CursorQueryDto,
  ): Promise<Paginated<MessageResponseDto>> {
    //Bu kişi odanın üyesi mi? Değilse 403. Başkasının konuşmasını okumak burada engelleniyor.
    await this.roomsService.assertCanAccess(roomId, viewer);
    const rows = await this.messagesRepository.listPage({
      roomId,
      viewerId: viewer.id,
      includeBlocked: viewer.role === 'ADMIN',
      limit: query.limit + 1,
      before: query.cursor ? decodeCursor(query.cursor) : null,
    });
    const hasNext = rows.length > query.limit;
    const page = rows.slice(0, query.limit);
    const lastMessage = page.at(-1);
    const names = await this.usersService.findDisplayNames([
      ...new Set(page.map((message) => message.senderId)),
    ]);
    return {
      data: page.map((message) =>
        MessageResponseDto.from(message, names.get(message.senderId) ?? 'Bilinmeyen kullanıcı'),
      ),
      meta: { hasNext, nextCursor: hasNext && lastMessage ? encodeCursor(lastMessage) : null },
    };
  }

  async send(
    roomId: string,
    sender: User,
    body: string,
    clientMessageId: string,
  ): Promise<MessageResponseDto> {
    const room = await this.roomsService.assertCanAccess(roomId, sender);
    if (room.status === 'CLOSED') {
      throw new DomainException(CHAT_ERRORS.CHAT_ROOM_CLOSED);
    }
    const message = await this.messagesRepository.insertOnce({
      roomId,
      senderId: sender.id,
      body: body.trim(),
      clientMessageId,
      status: 'DELIVERED',
    });
    return MessageResponseDto.from(message, sender.displayName);
  }
}
