export interface IssuedInvite {
  token: string;
  expiresAt: Date;
}

export interface ValidInvite {
  inviteId: string;
  userId: string;
  email: string;
  displayName: string;
  expiresAt: Date;
}
