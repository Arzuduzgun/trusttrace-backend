import { PickType } from '@nestjs/swagger';
import { RegisterDto } from './register.dto';

export class AcceptInviteDto extends PickType(RegisterDto, ['password'] as const) {}
