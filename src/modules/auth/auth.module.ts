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
import { WsTicketService } from './ws-ticket.service';
import { AdminAgentsController } from './admin-agents.controller';
import { InvitesController } from './invites.controller';
import { InvitesRepository } from './invites.repository';
import { InvitesService } from './invites.service';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  controllers: [AuthController, AdminAgentsController, InvitesController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    WsTicketService,
    RefreshTokensRepository,
    InvitesService,
    InvitesRepository,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [WsTicketService, TokenService],
})
export class AuthModule {}
