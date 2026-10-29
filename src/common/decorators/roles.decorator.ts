//Bu da bir etiket: “bu endpoint’e sadece şu roller girebilir.”
import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../modules/users/users.types';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
