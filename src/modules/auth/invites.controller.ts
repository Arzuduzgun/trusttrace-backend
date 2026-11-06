import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { InvitePreviewResponseDto } from './dto/invite-preview-response.dto';
import { InvitesService } from './invites.service';

@ApiTags('Auth')
@Public()
@Controller('auth/invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get(':token')
  @ApiEnvelope(InvitePreviewResponseDto)
  async preview(@Param('token') token: string): Promise<InvitePreviewResponseDto> {
    return InvitePreviewResponseDto.from(await this.invitesService.preview(token));
  }

  @Post(':token/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  accept(@Param('token') token: string, @Body() dto: AcceptInviteDto): Promise<void> {
    return this.invitesService.accept(token, dto.password);
  }
}
