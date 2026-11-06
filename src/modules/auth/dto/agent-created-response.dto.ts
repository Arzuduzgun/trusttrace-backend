import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AgentInviteResponseDto } from './agent-invite-response.dto';

export class AgentCreatedResponseDto {
  user!: UserResponseDto;
  invite!: AgentInviteResponseDto;
}
