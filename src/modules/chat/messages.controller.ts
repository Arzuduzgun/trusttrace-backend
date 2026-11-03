import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CursorQueryDto } from '../../common/dto/cursor-query.dto';
import type { Paginated } from '../../common/types/api-response.types';
import type { User } from '../users/types/users.types';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('rooms/:roomId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiEnvelope(MessageResponseDto, { paginated: true })
  list(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Query() query: CursorQueryDto,
    @CurrentUser() user: User,
  ): Promise<Paginated<MessageResponseDto>> {
    return this.messagesService.listHistory(roomId, user, query);
  }
}
