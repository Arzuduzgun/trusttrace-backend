//İsteğin içine bakar ve guard’ın oraya koyduğu user’ı döndürür.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '../../modules/users/users.types';
import type { AuthenticatedRequest } from '../types/authenticated-request.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().user;
  },
);
