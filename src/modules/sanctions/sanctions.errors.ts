import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/error-code.types';

export const SANCTION_ERRORS = {
  SANCTION_CANNOT_TARGET_SELF: {
    code: 'SANCTION_CANNOT_TARGET_SELF',
    status: HttpStatus.CONFLICT,
    message: 'Kendinize ceza veremezsiniz.',
  },
  SANCTION_CANNOT_TARGET_ADMIN: {
    code: 'SANCTION_CANNOT_TARGET_ADMIN',
    status: HttpStatus.CONFLICT,
    message: 'Bir yöneticiye ceza verilemez.',
  },
  SANCTION_USER_ALREADY_BANNED: {
    code: 'SANCTION_USER_ALREADY_BANNED',
    status: HttpStatus.CONFLICT,
    message: 'Bu kullanıcı zaten banlı.',
  },
  SANCTION_EVENT_NOT_FOUND: {
    code: 'SANCTION_EVENT_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'Ceza kaydı bulunamadı.',
  },
  SANCTION_ALREADY_REVOKED: {
    code: 'SANCTION_ALREADY_REVOKED',
    status: HttpStatus.CONFLICT,
    message: 'Bu ceza zaten kaldırılmış.',
  },
  SANCTION_NOT_CURRENT: {
    code: 'SANCTION_NOT_CURRENT',
    status: HttpStatus.CONFLICT,
    message: 'Bu ceza artık geçerli değil.',
  },
} as const satisfies ErrorCatalog;
