//GET /admin/moderation-events adresini açar. Sadece admin erişebilir.
import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { ModerationEventQueryDto } from './dto/moderation-event-query.dto';
import { ModerationEventResponseDto } from './dto/moderation-event-response.dto';
import { ModerationEventsService } from './moderation-events.service';

@Roles('ADMIN')
@Controller('admin/moderation-events')
export class AdminModerationEventsController {
  constructor(private readonly eventsService: ModerationEventsService) {}

  @Get()
  async list(@Query() query: ModerationEventQueryDto): Promise<ModerationEventResponseDto[]> {
    const events = await this.eventsService.list(query);
    return events.map((event) => ModerationEventResponseDto.from(event));
  }
}
