import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { AgentCreatedResponseDto } from './dto/agent-created-response.dto';
import { AgentInviteResponseDto } from './dto/agent-invite-response.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { InvitesService } from './invites.service';

@ApiTags('Admin – Agents')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/agents')
export class AdminAgentsController {
  constructor(
    private readonly authService: AuthService,
    private readonly invitesService: InvitesService,
  ) {}

  @Post()
  @ApiEnvelope(AgentCreatedResponseDto, { status: 201 })
  async create(@Body() dto: CreateAgentDto): Promise<AgentCreatedResponseDto> {
    const user = await this.authService.createAgent(dto);
    const invite = await this.invitesService.issue(user.id);
    return { user: UserResponseDto.from(user), invite: AgentInviteResponseDto.from(invite) };
  }

  @Post(':id/invite')
  @ApiEnvelope(AgentInviteResponseDto, { status: 201 })
  async reissueInvite(@Param('id', ParseUUIDPipe) userId: string): Promise<AgentInviteResponseDto> {
    return AgentInviteResponseDto.from(await this.invitesService.issue(userId));
  }
}
