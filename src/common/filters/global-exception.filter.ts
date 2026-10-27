import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { COMMON_ERRORS } from '../errors/common.errors';
import { DomainException } from '../errors/domain.exception';
import type { ApiFailure } from '../types/api-response.types';

interface ErrorResponse {
  status: number;
  body: ApiFailure;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.toErrorResponse(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }
    response.status(status).json(body);
  }

  private toErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof DomainException) {
      return {
        status: exception.getStatus(),
        body: {
          success: false,
          error: {
            code: exception.code,
            message: exception.message,
            ...(exception.details ? { details: exception.details } : {}),
          },
        },
      };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code =
        status === HttpStatus.NOT_FOUND ? COMMON_ERRORS.ROUTE_NOT_FOUND.code : `HTTP_${status}`;
      return { status, body: { success: false, error: { code, message: exception.message } } };
    }
    const fallback = COMMON_ERRORS.INTERNAL_ERROR;
    return {
      status: fallback.status,
      body: { success: false, error: { code: fallback.code, message: fallback.message } },
    };
  }
}
