import { IsUUID } from 'class-validator';

export class ReplaceAgentDto {
  @IsUUID()
  newAgentId!: string;
}
