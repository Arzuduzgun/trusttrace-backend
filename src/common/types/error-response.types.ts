import type { ApiFailure } from './api-response.types';

export interface ErrorResponse {
  status: number;
  body: ApiFailure;
}
