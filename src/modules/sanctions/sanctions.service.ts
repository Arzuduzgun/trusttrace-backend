//Ceza işlemlerinin bütün kuralları burada. SQL yazmaz; users, token, defter ve chat servislerini doğru sırayla çağırır.
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { TokenService } from '../auth/token.service';
import { CHAT_EVENTS } from '../chat/chat.events';
import { ChatNotifierService } from '../chat/chat-notifier.service';
import { ModerationEventsService } from '../moderation-events/moderation-events.service';
import type { NewModerationEvent } from '../moderation-events/moderation-events.types';
import { UsersService } from '../users/users.service';
import type { User } from '../users/users.types';
import type { SanctionReasonDto } from './dto/sanction-reason.dto';
import type { SuspendUserDto } from './dto/suspend-user.dto';
import { SANCTION_ERRORS } from './sanctions.errors';
import type { SanctionType } from './sanctions.types';

const HOUR_IN_MS = 60 * 60 * 1000;

@Injectable()
export class SanctionsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly eventsService: ModerationEventsService,
    private readonly chatNotifier: ChatNotifierService,
  ) {}

  async suspend(targetId: string, admin: User, dto: SuspendUserDto): Promise<User> {
    const target = await this.getSanctionableTarget(targetId, admin);
    const suspendedUntil = dto.durationHours
      ? new Date(Date.now() + dto.durationHours * HOUR_IN_MS)
      : null;
    const updated = await this.usersService.applyStatusChange(
      target.id,
      { status: 'SUSPENDED', suspendedUntil },
      this.imposedEvent(target.id, admin, 'SUSPEND', dto.reason, suspendedUntil),
    );
    this.chatNotifier.notifyUser(target.id, CHAT_EVENTS.SANCTION_APPLIED, {
      sanction: 'SUSPEND',
      reason: dto.reason,
      suspendedUntil,
    });
    return updated;
  }

  async ban(targetId: string, admin: User, dto: SanctionReasonDto): Promise<User> {
    const target = await this.getSanctionableTarget(targetId, admin);
    const updated = await this.usersService.applyStatusChange(
      target.id,
      { status: 'BANNED', suspendedUntil: null, tokensValidAfter: new Date() },
      this.imposedEvent(target.id, admin, 'BAN', dto.reason, null),
    );
    await this.tokenService.revokeAllSessions(target.id);
    this.chatNotifier.notifyUser(target.id, CHAT_EVENTS.SANCTION_APPLIED, {
      sanction: 'BAN',
      reason: dto.reason,
      suspendedUntil: null,
    });
    this.chatNotifier.disconnectUser(target.id);
    return updated;
  }

  async revoke(
    targetId: string,
    eventId: string,
    admin: User,
    dto: SanctionReasonDto,
  ): Promise<User> {
    const event = await this.eventsService.findById(eventId);
    if (!event || event.subjectUserId !== targetId || event.eventType !== 'SANCTION_IMPOSED') {
      throw new DomainException(SANCTION_ERRORS.SANCTION_EVENT_NOT_FOUND);
    }
    if (await this.eventsService.hasRevocation(event.id)) {
      throw new DomainException(SANCTION_ERRORS.SANCTION_ALREADY_REVOKED);
    }
    const sanction = event.payload['sanction'];
    const target = await this.usersService.getById(targetId);
    const expectedStatus = sanction === 'BAN' ? 'BANNED' : 'SUSPENDED';
    if (target.status !== expectedStatus) {
      throw new DomainException(SANCTION_ERRORS.SANCTION_NOT_CURRENT);
    }
    const updated = await this.usersService.applyStatusChange(
      target.id,
      { status: 'ACTIVE', suspendedUntil: null },
      {
        eventType: 'SANCTION_REVOKED',
        actorType: 'ADMIN',
        actorId: admin.id,
        subjectUserId: target.id,
        roomId: null,
        messageId: null,
        refersToEventId: event.id,
        traceId: null,
        payload: { revokedSanction: sanction, reason: dto.reason },
      },
    );
    this.chatNotifier.notifyUser(target.id, CHAT_EVENTS.SANCTION_REVOKED, { reason: dto.reason });
    return updated;
  }

  //Admin kendini ya da başka bir admini hedef alıyorsa reddeder.
  private async getSanctionableTarget(targetId: string, admin: User): Promise<User> {
    if (targetId === admin.id) {
      throw new DomainException(SANCTION_ERRORS.SANCTION_CANNOT_TARGET_SELF);
    }
    const target = await this.usersService.getById(targetId);
    if (target.role === 'ADMIN') {
      throw new DomainException(SANCTION_ERRORS.SANCTION_CANNOT_TARGET_ADMIN);
    }
    if (target.status === 'BANNED') {
      throw new DomainException(SANCTION_ERRORS.SANCTION_USER_ALREADY_BANNED);
    }
    return target;
  }

  //“Ceza verildi” defter kaydını hazırlar: kim verdi, kime, hangi ceza, neden, ne zamana kadar.
  private imposedEvent(
    subjectUserId: string,
    admin: User,
    sanction: SanctionType,
    reason: string,
    suspendedUntil: Date | null,
  ): NewModerationEvent {
    return {
      eventType: 'SANCTION_IMPOSED',
      actorType: 'ADMIN',
      actorId: admin.id,
      subjectUserId,
      roomId: null,
      messageId: null,
      refersToEventId: null,
      traceId: null,
      payload: { sanction, reason, suspendedUntil: suspendedUntil?.toISOString() ?? null },
    };
  }
}
