import type { User } from '../users/users.types';

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

export interface ChatSocketData {
  user: User;
}
