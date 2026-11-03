import type { User } from './types/users.types';

export function canSendMessages(user: User, now: Date = new Date()): boolean {
  if (user.status === 'ACTIVE') {
    return true;
  }
  if (user.status === 'SUSPENDED') {
    return user.suspendedUntil !== null && user.suspendedUntil <= now;
  }
  return false;
}
