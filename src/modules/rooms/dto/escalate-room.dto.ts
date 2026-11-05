import { IsUUID } from 'class-validator';
import { SanctionReasonDto } from '../../sanctions/dto/sanction-reason.dto';

export class EscalateRoomDto extends SanctionReasonDto {
  @IsUUID()
  customerId!: string;
}
