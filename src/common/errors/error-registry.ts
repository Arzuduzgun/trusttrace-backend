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

export const ERROR_REGISTRY = buildRegistry([COMMON_ERRORS]);
