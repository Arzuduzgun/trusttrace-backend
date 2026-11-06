import type { ValidInvite } from '../types/invites.types';

export class InvitePreviewResponseDto {
  email!: string;
  displayName!: string;
  expiresAt!: Date;

  static from(invite: ValidInvite): InvitePreviewResponseDto {
    return { email: invite.email, displayName: invite.displayName, expiresAt: invite.expiresAt };
  }
}
