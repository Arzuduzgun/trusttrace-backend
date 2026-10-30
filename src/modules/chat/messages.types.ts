//Mesajın uygulama içindeki şeklini tanımlar.
import type { messageStatusEnum } from '../../database/schema';
import type { CursorPosition } from '../../common/pagination/cursor';

export type MessageStatus = (typeof messageStatusEnum.enumValues)[number];

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  clientMessageId: string;
  status: MessageStatus;
  createdAt: Date;
}

export interface NewMessage {
  roomId: string;
  senderId: string;
  body: string;
  clientMessageId: string;
  status: MessageStatus;
}

//Repository’ye “hangi sayfayı istiyorum” bilgisini taşır.
export interface MessagePageQuery {
  roomId: string;
  viewerId: string;
  includeBlocked: boolean;
  limit: number;
  before: CursorPosition | null;
}
