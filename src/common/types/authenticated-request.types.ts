// “Giriş yapılmış bir istek”in tipini tanımlar. Bu, normal bir Express isteği, artı içinde user alanı.
import type { Request } from 'express';
import type { User } from '../../modules/users/users.types';

export interface AuthenticatedRequest extends Request {
  user: User;
}
