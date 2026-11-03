import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '../../modules/users/types/users.types';
import type { AuthenticatedRequest } from '../types/authenticated-request.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().user;
  },
);
