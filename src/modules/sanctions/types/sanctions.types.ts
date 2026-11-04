import type { REVOKE_REASON_CODES, SANCTION_REASON_CODES } from '../sanction-reasons';

export type SanctionType = 'SUSPEND' | 'BAN';
export type SanctionReasonCode = (typeof SANCTION_REASON_CODES)[number];
export type RevokeReasonCode = (typeof REVOKE_REASON_CODES)[number];
