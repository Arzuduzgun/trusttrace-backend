//Mesajın dışarıya gösterilen hali. Gönderenin id’sine ek olarak adını (senderName) da içerir.
import type { Message, MessageStatus } from '../messages.types';

export class MessageResponseDto {
  id!: string;
  roomId!: string;
  senderId!: string;
  senderName!: string;
  body!: string;
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
