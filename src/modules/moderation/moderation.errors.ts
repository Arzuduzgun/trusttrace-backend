import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/error-code.types';

export const MODERATION_ERRORS = {
  MODERATION_RULE_NOT_FOUND: {
    code: 'MODERATION_RULE_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'Kural bulunamadı.',
  },
  MODERATION_RULE_ALREADY_EXISTS: {
    code: 'MODERATION_RULE_ALREADY_EXISTS',
    status: HttpStatus.CONFLICT,
    message: 'Bu kural zaten tanımlı.',
  },
  MODERATION_PATTERN_EMPTY: {
    code: 'MODERATION_PATTERN_EMPTY',
    status: HttpStatus.BAD_REQUEST,
    message: 'Kural en az bir harf içermelidir.',
  },
} as const satisfies ErrorCatalog;
