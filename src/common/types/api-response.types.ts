// Frontend'in göreceği iki cevap şekli: { success: true, data } ve { success: false, error }.
import type { ErrorDetail } from '../errors/error-code.types';

export type ListMeta = Readonly<Record<string, string | number | boolean | null>>;

export interface Paginated<T> {
  data: T[];
  meta: ListMeta;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ListMeta;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
    requestId?: string;
  };
}
