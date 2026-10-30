// Bütün hata kodlarını toplar; aynı kod iki kez varsa uygulama açılmaz.
import { AUTH_ERRORS } from '../../modules/auth/auth.errors';
import { CHAT_ERRORS } from '../../modules/chat/chat.errors';
import { ROOM_ERRORS } from '../../modules/rooms/rooms.errors';
import { USER_ERRORS } from '../../modules/users/users.errors';
import { COMMON_ERRORS } from './common.errors';
import type { ErrorCatalog, ErrorCodeDefinition } from './error-code.types';

function buildRegistry(catalogs: ErrorCatalog[]): ReadonlyMap<string, ErrorCodeDefinition> {
  const registry = new Map<string, ErrorCodeDefinition>();
  for (const catalog of catalogs) {
    for (const definition of Object.values(catalog)) {
      if (registry.has(definition.code)) {
        throw new Error(`Duplicate error code: ${definition.code}`);
      }
      registry.set(definition.code, definition);
    }
  }
  return registry;
}

export const ERROR_REGISTRY = buildRegistry([
  COMMON_ERRORS,
  USER_ERRORS,
  AUTH_ERRORS,
  ROOM_ERRORS,
  CHAT_ERRORS,
]);
