import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiEnvelopeOptions } from '../types/api-envelope-options.types';

export const ApiEnvelope = (
  model: Type<object>,
  options: ApiEnvelopeOptions = {},
): MethodDecorator & ClassDecorator => {
  const item = { $ref: getSchemaPath(model) };
  const data = options.isArray || options.paginated ? { type: 'array', items: item } : item;
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: options.status ?? 200,
      schema: {
        type: 'object',
        required: options.paginated ? ['success', 'data', 'meta'] : ['success', 'data'],
        properties: {
          success: { type: 'boolean', enum: [true] },
          data,
          ...(options.paginated
            ? {
                meta: {
                  type: 'object',
                  properties: {
                    hasNext: { type: 'boolean' },
                    nextCursor: { type: 'string', nullable: true },
                  },
                },
              }
            : {}),
        },
      },
    }),
  );
};
