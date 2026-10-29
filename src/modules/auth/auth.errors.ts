// Auth hata kodları. E-posta mı yanlış şifre mi, dışarıya söylenmez: ikisi de AUTH_INVALID_CREDENTIALS.
import { HttpStatus } from '@nestjs/common';
import type { ErrorCatalog } from '../../common/errors/error-code.types';

export const AUTH_ERRORS = {
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_INVALID_CREDENTIALS',
    status: HttpStatus.UNAUTHORIZED,
    message: 'E-posta veya şifre hatalı.',
  },
  AUTH_ACCOUNT_BANNED: {
    code: 'AUTH_ACCOUNT_BANNED',
    status: HttpStatus.FORBIDDEN,
    message: 'Hesabınız kalıcı olarak kapatıldı.',
  },
  AUTH_REFRESH_INVALID: {
    code: 'AUTH_REFRESH_INVALID',
    status: HttpStatus.UNAUTHORIZED,
    message: 'Oturum geçersiz, lütfen tekrar giriş yapın.',
  },
  AUTH_REFRESH_EXPIRED: {
    code: 'AUTH_REFRESH_EXPIRED',
    status: HttpStatus.UNAUTHORIZED,
    message: 'Oturum süresi doldu, lütfen tekrar giriş yapın.',
  },
  AUTH_REFRESH_REUSED: {
    code: 'AUTH_REFRESH_REUSED',
    status: HttpStatus.UNAUTHORIZED,
    message: 'Güvenlik nedeniyle oturum kapatıldı, lütfen tekrar giriş yapın.',
  },
  AUTH_TOKEN_MISSING: {
    code: 'AUTH_TOKEN_MISSING',
    status: HttpStatus.UNAUTHORIZED,
    message: 'Bu işlem için giriş yapmalısınız.',
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    status: HttpStatus.UNAUTHORIZED,
    message: 'Oturum süresi doldu.',
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_TOKEN_INVALID',
    status: HttpStatus.UNAUTHORIZED,
    message: 'Geçersiz oturum.',
  },
  AUTH_TOKEN_REVOKED: {
    code: 'AUTH_TOKEN_REVOKED',
    status: HttpStatus.UNAUTHORIZED,
    message: 'Oturum sonlandırıldı, lütfen tekrar giriş yapın.',
  },
  AUTH_FORBIDDEN_ROLE: {
    code: 'AUTH_FORBIDDEN_ROLE',
    status: HttpStatus.FORBIDDEN,
    message: 'Bu işlem için yetkiniz yok.',
  },
} as const satisfies ErrorCatalog;
