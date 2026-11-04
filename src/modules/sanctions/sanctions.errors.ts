import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/types/error-code.types';

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
  SANCTION_NOT_CURRENT: {
    code: 'SANCTION_NOT_CURRENT',
    status: HttpStatus.CONFLICT,
    message: 'Bu ceza artık geçerli değil.',
  },
  SANCTION_NONE_ACTIVE: {
    code: 'SANCTION_NONE_ACTIVE',
    status: HttpStatus.CONFLICT,
    message: 'Bu kullanıcının kaldırılabilecek bir cezası yok.',
  },
} as const satisfies ErrorCatalog;
