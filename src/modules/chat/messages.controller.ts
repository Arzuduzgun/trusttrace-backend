//GET /api/v1/rooms/:roomId/messages adresini açar.
import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CursorQueryDto } from '../../common/dto/cursor-query.dto';
import type { Paginated } from '../../common/types/api-response.types';
import type { User } from '../users/users.types';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessagesService } from './messages.service';

@Controller('rooms/:roomId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  list(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Query() query: CursorQueryDto,
    @CurrentUser() user: User,
  ): Promise<Paginated<MessageResponseDto>> {
    return this.messagesService.listHistory(roomId, user, query);
  }
}
