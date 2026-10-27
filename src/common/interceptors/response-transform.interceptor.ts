import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RAW_RESPONSE_KEY } from '../decorators/raw-response.decorator';
import type { ApiSuccess, Paginated } from '../types/api-response.types';

function isPaginated(value: unknown): value is Paginated<unknown> {
  return typeof value === 'object' && value !== null && 'data' in value && 'meta' in value;
}

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isRaw = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isRaw || context.getType() !== 'http') {
      return next.handle();
    }
    return next.handle().pipe(map((result: unknown) => this.wrap(result)));
  }

  private wrap(result: unknown): ApiSuccess<unknown> {
    if (isPaginated(result)) {
      return { success: true, data: result.data, meta: result.meta };
    }
    return { success: true, data: result };
  }
}
