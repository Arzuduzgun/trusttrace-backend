import type { HttpStatus } from '@nestjs/common';

export interface ErrorCodeDefinition {
  code: string;
  status: HttpStatus;
  message: string;
}

export type ErrorCatalog = Readonly<Record<string, ErrorCodeDefinition>>;

export interface ErrorDetail {
  field: string;
  constraints: string[];
}
