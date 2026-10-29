// Auth parçalarını bağlar. Kullanıcıya UsersModule üzerinden ulaşır.
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { TokenService } from './token.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    RefreshTokensRepository,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
