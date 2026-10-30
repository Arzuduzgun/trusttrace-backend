import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/error-code.types';

//Oda yok.
export const ROOM_ERRORS = {
  ROOM_NOT_FOUND: {
    code: 'ROOM_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'Oda bulunamadı.',
  },
  //Oda var ama üyesi değil.
  ROOM_ACCESS_DENIED: {
    code: 'ROOM_ACCESS_DENIED',
    status: HttpStatus.FORBIDDEN,
    message: 'Bu odanın üyesi değilsiniz.',
  },
  //Bu odaya katılamazsın. Örneğin 1-1 bir odaya dışarıdan katılmaya çalışmak ya da kapalı bir odaya girmek.
  ROOM_NOT_JOINABLE: {
    code: 'ROOM_NOT_JOINABLE',
    status: HttpStatus.CONFLICT,
    message: 'Bu odaya katılamazsınız.',
  },
  //Zaten üyesin.
  ROOM_MEMBER_ALREADY_EXISTS: {
    code: 'ROOM_MEMBER_ALREADY_EXISTS',
    status: HttpStatus.CONFLICT,
    message: 'Bu kullanıcı zaten odanın üyesi.',
  },
  //Şu anda müsait temsilci yok.
  ROOM_NO_AGENT_AVAILABLE: {
    code: 'ROOM_NO_AGENT_AVAILABLE',
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Şu anda müsait temsilci yok, lütfen biraz sonra tekrar deneyin.',
  },
} as const satisfies ErrorCatalog;
