import { Injectable } from '@nestjs/common';
import { ModerationEventsRepository } from './moderation-events.repository';
import type {
  ChainBreakReason,
  ChainVerification,
  ChainedModerationEvent,
  ModerationEvent,
  ModerationEventFilter,
} from './types/moderation-events.types';
import { GENESIS_HASH, hashEvent } from './ledger-hash';

const CHAIN_PAGE_SIZE = 500;

@Injectable()
export class ModerationEventsService {
  constructor(private readonly eventsRepository: ModerationEventsRepository) {}

  list(filter: ModerationEventFilter): Promise<ChainedModerationEvent[]> {
    return this.eventsRepository.list(filter);
  }

  hasRevocation(eventId: string): Promise<boolean> {
    return this.eventsRepository.hasRevocation(eventId);
  }

  findLatestSanction(userId: string): Promise<ModerationEvent | null> {
    return this.eventsRepository.findLatestSanction(userId);
  }

  async verifyChain(): Promise<ChainVerification> {
    let expectedPrev = GENESIS_HASH;
    let checked = 0;
    let afterSeq = 0;
    for (;;) {
      const page = await this.eventsRepository.listChainPage(afterSeq, CHAIN_PAGE_SIZE);
      for (const event of page) {
        if (event.prevHash !== expectedPrev) {
          return this.broken(event.seq, 'PREV_HASH_MISMATCH', checked);
        }
        if (hashEvent(event, event.prevHash) !== event.hash) {
          return this.broken(event.seq, 'CONTENT_HASH_MISMATCH', checked);
        }
        expectedPrev = event.hash;
        checked += 1;
      }
      const last = page.at(-1);
      if (!last || page.length < CHAIN_PAGE_SIZE) {
        break;
      }
      afterSeq = last.seq;
    }
    return {
      valid: true,
      checkedCount: checked,
      brokenAtSeq: null,
      reason: null,
      headHash: checked > 0 ? expectedPrev : null,
      verifiedAt: new Date(),
    };
  }

  private broken(seq: number, reason: ChainBreakReason, checked: number): ChainVerification {
    return {
      valid: false,
      checkedCount: checked,
      brokenAtSeq: seq,
      reason,
      headHash: null,
      verifiedAt: new Date(),
    };
  }
}
