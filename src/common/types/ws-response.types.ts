//WebSocket cevaplarının şeklini tanımlar.
import type { ApiFailure } from './api-response.types';

export interface WsSuccess<T> {
  ok: true;
  data: T;
}

export interface WsFailure {
  ok: false;
  error: ApiFailure['error'];
}
