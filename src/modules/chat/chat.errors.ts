import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/error-code.types';

export const CHAT_ERRORS = {
  CHAT_ROOM_CLOSED: {
    code: 'CHAT_ROOM_CLOSED',
    status: HttpStatus.CONFLICT,
    message: 'Bu oda kapatıldı, mesaj gönderilemez.',
  },
  CHAT_SENDER_SUSPENDED: {
    code: 'CHAT_SENDER_SUSPENDED',
    status: HttpStatus.FORBIDDEN,
    message: 'Hesabınız askıya alındı, mesaj gönderemezsiniz.',
  },
} as const satisfies ErrorCatalog;
