//WebSocket olaylarının adlarını ve kanal adlarını tek yerde tanımlar.
import type { User } from '../users/users.types';

/*CHAT_EVENTS: Olay adları.
room:join: odaya katıl
room:leave: odadan ayrıl
message:send: mesaj gönder
message:new: yeni mesaj geldi*/
export const CHAT_EVENTS = {
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  SEND_MESSAGE: 'message:send',
  NEW_MESSAGE: 'message:new',
  SANCTION_APPLIED: 'sanction:applied',
  SANCTION_REVOKED: 'sanction:revoked',
} as const;

export const roomChannel = (roomId: string): string => `room:${roomId}`;

export const userChannel = (userId: string): string => `user:${userId}`;

//Hat açıldığında, hattın üzerine “bu hat kime ait” bilgisini koyuyoruz.
export interface ChatSocketData {
  user: User;
}
