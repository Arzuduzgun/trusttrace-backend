import type { ValidationError } from 'class-validator';
import { COMMON_ERRORS } from '../errors/common.errors';
import { DomainException } from '../errors/domain.exception';
import type { ErrorDetail } from '../errors/error-code.types';

function flatten(errors: ValidationError[], parentPath = ''): ErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const own = error.constraints ? [{ field, constraints: Object.values(error.constraints) }] : [];
    const children = error.children?.length ? flatten(error.children, field) : [];
    return [...own, ...children];
  });
}

export function validationExceptionFactory(errors: ValidationError[]): DomainException {
  return new DomainException(COMMON_ERRORS.VALIDATION_FAILED, {}, flatten(errors));
}
