import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/error-code.types';

export const CHAT_ERRORS = {
  CHAT_ROOM_CLOSED: {
    code: 'CHAT_ROOM_CLOSED',
    status: HttpStatus.CONFLICT,
    message: 'Bu oda kapatıldı, mesaj gönderilemez.',
  },
} as const satisfies ErrorCatalog;
