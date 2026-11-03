import { ApiProperty } from '@nestjs/swagger';
import { messageStatusEnum } from '../../../database/schema';
import type { Message, MessageStatus } from '../messages.types';

export class MessageResponseDto {
  id!: string;
  roomId!: string;
  senderId!: string;
  senderName!: string;
  body!: string;
  @ApiProperty({ enum: messageStatusEnum.enumValues, enumName: 'MessageStatus' })
  status!: MessageStatus;
  clientMessageId!: string;
  createdAt!: Date;

  static from(message: Message, senderName: string): MessageResponseDto {
    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName,
      body: message.body,
      status: message.status,
      clientMessageId: message.clientMessageId,
      createdAt: message.createdAt,
    };
  }
}
