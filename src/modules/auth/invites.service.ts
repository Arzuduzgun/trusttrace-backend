import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { UsersService } from '../users/users.service';
import { AUTH_ERRORS } from './auth.errors';
import { InvitesRepository } from './invites.repository';
import { PasswordService } from './password.service';
import type { IssuedInvite, ValidInvite } from './types/invites.types';

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class InvitesService {
  constructor(
    private readonly invitesRepository: InvitesRepository,
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
  ) {}

  async issue(userId: string): Promise<IssuedInvite> {
    const user = await this.usersService.getById(userId);
    if (user.role !== 'AGENT') {
      throw new DomainException(AUTH_ERRORS.AUTH_INVITE_NOT_AGENT);
    }
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    await this.invitesRepository.replaceForUser(user.id, hashToken(token), expiresAt);
    return { token, expiresAt };
  }

  async preview(token: string): Promise<ValidInvite> {
    const invite = await this.invitesRepository.findValid(hashToken(token));
    if (!invite) {
      throw new DomainException(AUTH_ERRORS.AUTH_INVITE_INVALID);
    }
    return invite;
  }

  async accept(token: string, password: string): Promise<void> {
    const invite = await this.preview(token);
    const passwordHash = await this.passwordService.hash(password);
    await this.invitesRepository.accept(invite.inviteId, invite.userId, passwordHash);
  }
}
