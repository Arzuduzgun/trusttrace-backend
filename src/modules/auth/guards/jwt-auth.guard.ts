import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { DomainException } from '../../../common/errors/domain.exception';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.types';
import { AppConfigService } from '../../../config/app-config.service';
import { UsersService } from '../../users/users.service';
import type { User } from '../../users/users.types';
import { AUTH_ERRORS } from '../auth.errors';
import type { VerifiedAccessToken } from '../auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const payload = await this.verify(this.extractToken(request));
    request.user = await this.loadActiveUser(payload);
    return true;
  }
  private extractToken(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new DomainException(AUTH_ERRORS.AUTH_TOKEN_MISSING);
    }
    return token;
  }

  //Token’ın imzasını secret ile kontrol eder.
  private async verify(token: string): Promise<VerifiedAccessToken> {
    try {
      return await this.jwtService.verifyAsync<VerifiedAccessToken>(token, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        algorithms: ['HS256'],
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new DomainException(AUTH_ERRORS.AUTH_TOKEN_EXPIRED);
      }
      throw new DomainException(AUTH_ERRORS.AUTH_TOKEN_INVALID);
    }
  }

  private async loadActiveUser(payload: VerifiedAccessToken): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new DomainException(AUTH_ERRORS.AUTH_TOKEN_INVALID);
    }
    if (user.status === 'BANNED') {
      throw new DomainException(AUTH_ERRORS.AUTH_ACCOUNT_BANNED);
    }
    const validAfterSeconds = Math.floor(user.tokensValidAfter.getTime() / 1000);
    if (payload.iat < validAfterSeconds) {
      throw new DomainException(AUTH_ERRORS.AUTH_TOKEN_REVOKED);
    }
    return user;
  }
}
