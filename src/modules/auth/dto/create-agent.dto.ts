import { PickType } from '@nestjs/swagger';
import { RegisterDto } from './register.dto';

export class CreateAgentDto extends PickType(RegisterDto, ['email', 'displayName'] as const) {}
