import { PickType } from '@nestjs/swagger';
import { RegisterDto } from './register.dto';

export class CreateAgentDto extends PickType(RegisterDto, [
  'email',
  'password',
  'displayName',
] as const) {}
