import { IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  roomId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  @Matches(/\S/, { message: 'body must not be empty' })
  body!: string;

  @IsUUID()
  clientMessageId!: string;
}
