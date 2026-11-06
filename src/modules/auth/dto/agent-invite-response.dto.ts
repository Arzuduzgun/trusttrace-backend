import type { IssuedInvite } from '../types/invites.types';

export class AgentInviteResponseDto {
  token!: string;
  expiresAt!: Date;

  static from(invite: IssuedInvite): AgentInviteResponseDto {
    return { token: invite.token, expiresAt: invite.expiresAt };
  }
}
