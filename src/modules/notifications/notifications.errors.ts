import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/types/error-code.types';

export const NOTIFICATION_ERRORS = {
  NOTIFICATION_NOT_FOUND: {
    code: 'NOTIFICATION_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'Bildirim bulunamadı.',
  },
} as const satisfies ErrorCatalog;
