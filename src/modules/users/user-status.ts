//Bu kullanıcı şu anda mesaj gönderebilir mi? sorusunu cevaplar.
import type { User } from './users.types';

export function canSendMessages(user: User, now: Date = new Date()): boolean {
  if (user.status === 'ACTIVE') {
    return true;
  }
  if (user.status === 'SUSPENDED') {
    return user.suspendedUntil !== null && user.suspendedUntil <= now;
  }
  return false;
}
