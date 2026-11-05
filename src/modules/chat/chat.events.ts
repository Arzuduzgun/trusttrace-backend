export const CHAT_EVENTS = {
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  SEND_MESSAGE: 'message:send',
  NEW_MESSAGE: 'message:new',
  SANCTION_APPLIED: 'sanction:applied',
  SANCTION_REVOKED: 'sanction:revoked',
  MESSAGE_FAILED: 'message:failed',
  NOTIFICATION_NEW: 'notification:new',
} as const;

export const roomChannel = (roomId: string): string => `room:${roomId}`;

export const userChannel = (userId: string): string => `user:${userId}`;
