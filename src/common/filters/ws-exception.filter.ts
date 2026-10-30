//WebSocket’te fırlatılan hataları yakalayıp { ok: false, error } şekline çevirir. HTTP’deki GlobalExceptionFilter’ın WebSocket karşılığı.
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { COMMON_ERRORS } from '../errors/common.errors';
import { DomainException } from '../errors/domain.exception';
import type { WsFailure } from '../types/ws-response.types';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);
  /*Mesajı gönderen taraf onay bekliyorsa (ack), hatayı o onay cevabına koyar. 
    Gönderen “mesajım neden gitmedi?” sorusunun cevabını hemen alır.
    Onay beklemiyorsa, hatayı exception adlı bir olayla gönderir.*/
  catch(exception: unknown, host: ArgumentsHost): void {
    const failure = this.toFailure(exception);
    const ack: unknown = host.getArgByIndex(2);
    if (typeof ack === 'function') {
      ack(failure);
      return;
    }
    host.switchToWs().getClient<Socket>().emit('exception', failure);
  }
  //Bizim DomainException’ımızsa kodunu ve mesajını kullanır. Beklenmeyen bir hataysa detayını loglar, kullanıcıya sadece INTERNAL_ERROR gösterir.
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
