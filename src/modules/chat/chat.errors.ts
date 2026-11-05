import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/types/error-code.types';

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
  CHAT_MESSAGE_FAILED: {
    code: 'CHAT_MESSAGE_FAILED',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Mesaj işlenemedi, lütfen tekrar deneyin.',
  },
  CHAT_RATE_LIMITED: {
    code: 'CHAT_RATE_LIMITED',
    status: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Çok hızlı mesaj gönderiyorsunuz. Birkaç saniye bekleyip tekrar deneyin.',
  },
  CHAT_ADMIN_READ_ONLY: {
    code: 'CHAT_ADMIN_READ_ONLY',
    status: HttpStatus.FORBIDDEN,
    message: 'Yönetici görünümü salt okunurdur; mesaj gönderilemez.',
  },
} as const satisfies ErrorCatalog;
