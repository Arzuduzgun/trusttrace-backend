import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from './error-code.types';

export const COMMON_ERRORS = {
  VALIDATION_FAILED: {
    code: 'VALIDATION_FAILED',
    status: HttpStatus.BAD_REQUEST,
    message: 'Gönderilen veri geçersiz.',
  },
  ROUTE_NOT_FOUND: {
    code: 'ROUTE_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'İstenen adres bulunamadı.',
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Beklenmeyen bir hata oluştu.',
  },
} as const satisfies ErrorCatalog;
