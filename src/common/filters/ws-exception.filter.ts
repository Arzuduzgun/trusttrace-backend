//WebSocket’te fırlatılan hataları yakalayıp { ok: false, error } şekline çevirir.
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { COMMON_ERRORS } from '../errors/common.errors';
import { DomainException } from '../errors/domain.exception';
import type { WsFailure } from '../types/ws-response.types';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost): void {
    const failure = this.toFailure(exception);
    const ack: unknown = host.getArgByIndex(2);
    if (typeof ack === 'function') {
      ack(failure);
      return;
    }
    host.switchToWs().getClient<Socket>().emit('exception', failure);
  }
  private toFailure(exception: unknown): WsFailure {
    if (exception instanceof DomainException) {
      return {
        ok: false,
        error: {
          code: exception.code,
          message: exception.message,
          ...(exception.details ? { details: exception.details } : {}),
        },
      };
    }
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    const fallback = COMMON_ERRORS.INTERNAL_ERROR;
    return { ok: false, error: { code: fallback.code, message: fallback.message } };
  }
}
