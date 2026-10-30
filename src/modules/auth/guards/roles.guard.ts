//Giriş yapan kullanıcının yetkisini kontrol eder.
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { DomainException } from '../../../common/errors/domain.exception';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.types';
import type { UserRole } from '../../users/users.types';
import { AUTH_ERRORS } from '../auth.errors';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /*Endpoint’te @Roles() etiketi yoksa → giriş yapmış herkes geçer.
  Etiket varsa → kullanıcının rolü listede mi diye bakar. Değilse AUTH_FORBIDDEN_ROLE (403) fırlatır. 
  Hata cevabının details kısmında hangi rollerin gerektiği yazar.*/
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (requiredRoles.includes(user.role)) {
      return true;
    }
    throw new DomainException(AUTH_ERRORS.AUTH_FORBIDDEN_ROLE, {}, [
      { field: 'role', constraints: requiredRoles },
    ]);
  }
}
