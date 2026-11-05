import { Injectable } from '@nestjs/common';
import type { CursorQueryDto } from '../../common/dto/cursor-query.dto';
import { DomainException } from '../../common/errors/domain.exception';
import { decodeCursor, encodeCursor } from '../../common/pagination/cursor';
import type { Paginated } from '../../common/types/api-response.types';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import type { User } from '../users/types/users.types';
import { CHAT_ERRORS } from './chat.errors';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessagesRepository } from './messages.repository';
import { Message, MessageStatus } from './types/messages.types';
import { ScanResult, ScanVerdict } from '../moderation/types/moderation.types';
import { ContentScannerService } from '../moderation/content-scanner.service';
import { NewModerationEvent } from '../moderation-events/types/moderation-events.types';
import { canSendMessages } from '../users/user-status';
import { PinoLogger } from 'nestjs-pino';
import { RateLimiterService } from '../../redis/rate-limiter.service';

const STATUS_BY_VERDICT: Record<ScanVerdict, MessageStatus> = {
  CLEAN: 'DELIVERED',
  FLAG: 'FLAGGED',
  BLOCK: 'BLOCKED',
};

const PROCESSABLE_STATUSES: ReadonlySet<MessageStatus> = new Set(['PENDING', 'FAILED']);

const MESSAGE_LIMIT = 10;
const MESSAGE_WINDOW_SECONDS = 10;

@Injectable()
export class MessagesService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly messagesRepository: MessagesRepository,
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
    private readonly contentScanner: ContentScannerService,
    private readonly rateLimiter: RateLimiterService,
  ) {
    this.logger.setContext(MessagesService.name);
  }

  async listHistory(
    roomId: string,
    viewer: User,
    query: CursorQueryDto,
  ): Promise<Paginated<MessageResponseDto>> {
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
    const currentSender = await this.usersService.getById(sender.id);
    if (currentSender.role === 'ADMIN') {
      throw new DomainException(CHAT_ERRORS.CHAT_ADMIN_READ_ONLY);
    }
    if (!canSendMessages(currentSender)) {
      throw new DomainException(CHAT_ERRORS.CHAT_SENDER_SUSPENDED);
    }
    const limit = await this.rateLimiter.consume(
      `rl:msg:${currentSender.id}`,
      MESSAGE_LIMIT,
      MESSAGE_WINDOW_SECONDS,
    );
    if (!limit.allowed) {
      throw new DomainException(CHAT_ERRORS.CHAT_RATE_LIMITED);
    }
    const room = await this.roomsService.assertCanAccess(roomId, currentSender);
    if (room.status === 'CLOSED') {
      throw new DomainException(CHAT_ERRORS.CHAT_ROOM_CLOSED);
    }
    const message = await this.messagesRepository.insertOnce({
      roomId,
      senderId: currentSender.id,
      body: body.trim(),
      clientMessageId,
      status: 'PENDING',
    });
    const finalMessage = PROCESSABLE_STATUSES.has(message.status)
      ? await this.process(message)
      : message;
    return MessageResponseDto.from(finalMessage, currentSender.displayName);
  }

  private async process(message: Message): Promise<Message> {
    try {
      const scan = await this.contentScanner.scan(message.body);
      return await this.messagesRepository.finalize(
        message.id,
        STATUS_BY_VERDICT[scan.verdict],
        scan.verdict === 'CLEAN' ? undefined : (saved) => this.toViolationEvent(saved, scan),
      );
    } catch (error) {
      this.logger.error({ err: error, messageId: message.id }, 'Message processing failed');
      await this.messagesRepository.markFailed(message.id).catch(() => undefined);
      throw new DomainException(CHAT_ERRORS.CHAT_MESSAGE_FAILED);
    }
  }

  private toViolationEvent(saved: Message, scan: ScanResult): NewModerationEvent {
    return {
      eventType: 'VIOLATION_DETECTED',
      actorType: 'SYSTEM',
      actorId: null,
      subjectUserId: saved.senderId,
      roomId: saved.roomId,
      messageId: saved.id,
      refersToEventId: null,
      traceId: null,
      payload: { verdict: scan.verdict, messageBody: saved.body, matches: scan.matches },
    };
  }
}
