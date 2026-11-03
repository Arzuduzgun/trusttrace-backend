import type { Request } from 'express';
import type { User } from '../../modules/users/types/users.types';

export interface AuthenticatedRequest extends Request {
  user: User;
}
