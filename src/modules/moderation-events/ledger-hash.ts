import { createHash } from 'node:crypto';
import type { HashableEvent } from './types/moderation-events.types';

export const GENESIS_HASH = '0'.repeat(64);

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

export function hashEvent(event: HashableEvent, prevHash: string): string {
  const content = canonicalJson({
    id: event.id,
    eventType: event.eventType,
    actorType: event.actorType,
    actorId: event.actorId,
    subjectUserId: event.subjectUserId,
    roomId: event.roomId,
    messageId: event.messageId,
    refersToEventId: event.refersToEventId,
    payload: event.payload,
    traceId: event.traceId,
    occurredAt: event.occurredAt.toISOString(),
    prevHash,
  });
  return createHash('sha256').update(content).digest('hex');
}
