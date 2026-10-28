import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/error-code.types';

export const USER_ERRORS = {
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'Kullanıcı bulunamadı.',
  },
  USER_EMAIL_ALREADY_EXISTS: {
    code: 'USER_EMAIL_ALREADY_EXISTS',
    status: HttpStatus.CONFLICT,
    message: 'Bu e-posta adresi zaten kayıtlı.',
  },
} as const satisfies ErrorCatalog;
