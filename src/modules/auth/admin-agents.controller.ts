import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@ApiTags('Admin – Agents')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/agents')
export class AdminAgentsController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiEnvelope(UserResponseDto, { status: 201 })
  async create(@Body() dto: CreateAgentDto): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.authService.createAgent(dto));
  }
}
