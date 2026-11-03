import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { User } from '../users/users.types';
import { AuthService } from './auth.service';
import type { AuthResult } from './auth.types';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { WsTicketResponseDto } from './dto/ws-ticket-response.dto';
import { WsTicketService } from './ws-ticket.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly wsTicketService: WsTicketService,
  ) {}

  @Public()
  @Post('register')
  @ApiEnvelope(AuthResponseDto, { status: 201 })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(AuthResponseDto)
  login(@Body() dto: LoginDto): Promise<AuthResult> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(AuthResponseDto)
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResult> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  logout(@Body() dto: RefreshTokenDto): Promise<void> {
    return this.authService.logout(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('ws-ticket')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(WsTicketResponseDto)
  issueWsTicket(@CurrentUser() user: User): Promise<WsTicketResponseDto> {
    return this.wsTicketService.issue(user.id);
  }
}
