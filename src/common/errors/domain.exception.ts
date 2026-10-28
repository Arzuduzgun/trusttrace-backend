// Projedeki tek hata sınıfı. Kural bozulunca: throw new DomainException(USER_ERRORS.USER_NOT_FOUND)
import { HttpException } from '@nestjs/common';
import type { ErrorCodeDefinition, ErrorDetail } from './error-code.types';

type MessageParams = Readonly<Record<string, string | number>>;

export class DomainException extends HttpException {
  readonly code: string;
  readonly details: ErrorDetail[] | undefined;

  constructor(
    definition: ErrorCodeDefinition,
    params: MessageParams = {},
    details?: ErrorDetail[],
  ) {
    super(DomainException.interpolate(definition.message, params), definition.status);
    this.code = definition.code;
    this.details = details;
  }

  private static interpolate(template: string, params: MessageParams): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) => String(params[key] ?? match));
  }
}
