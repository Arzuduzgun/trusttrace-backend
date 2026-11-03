import type { Request } from 'express';
import type { User } from '../../modules/users/users.types';

export interface AuthenticatedRequest extends Request {
  user: User;
}
