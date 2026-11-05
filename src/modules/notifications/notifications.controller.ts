import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '../users/types/users.types';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiEnvelope(NotificationResponseDto, { isArray: true })
  async list(@CurrentUser() user: User): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsService.listForUser(user.id);
    return notifications.map((notification) => NotificationResponseDto.from(notification));
  }

  @Post('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  markAllRead(@CurrentUser() user: User): Promise<void> {
    return this.notificationsService.markAllRead(user.id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  markRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<void> {
    return this.notificationsService.markRead(user.id, id);
  }
}
