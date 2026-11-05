import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/types/error-code.types';

export const ROOM_ERRORS = {
  ROOM_NOT_FOUND: {
    code: 'ROOM_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'Oda bulunamadı.',
  },
  ROOM_ACCESS_DENIED: {
    code: 'ROOM_ACCESS_DENIED',
    status: HttpStatus.FORBIDDEN,
    message: 'Bu odanın üyesi değilsiniz.',
  },
  ROOM_NOT_JOINABLE: {
    code: 'ROOM_NOT_JOINABLE',
    status: HttpStatus.CONFLICT,
    message: 'Bu odaya katılamazsınız.',
  },
  ROOM_MEMBER_ALREADY_EXISTS: {
    code: 'ROOM_MEMBER_ALREADY_EXISTS',
    status: HttpStatus.CONFLICT,
    message: 'Bu kullanıcı zaten odanın üyesi.',
  },
  ROOM_NO_AGENT_AVAILABLE: {
    code: 'ROOM_NO_AGENT_AVAILABLE',
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Şu anda müsait temsilci yok, lütfen biraz sonra tekrar deneyin.',
  },
  ROOM_NOT_ESCALATABLE: {
    code: 'ROOM_NOT_ESCALATABLE',
    status: HttpStatus.CONFLICT,
    message: 'Kapalı bir görüşme yöneticiye bildirilemez.',
  },
  ROOM_MEMBER_NOT_CUSTOMER: {
    code: 'ROOM_MEMBER_NOT_CUSTOMER',
    status: HttpStatus.BAD_REQUEST,
    message: 'Seçilen kişi bu odanın müşterisi değil.',
  },
} as const satisfies ErrorCatalog;
