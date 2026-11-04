import { Injectable } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import type { User, UserRole } from '../users/types/users.types';
import { AUTH_ERRORS } from './auth.errors';
import type { AuthResult } from './types/auth.types';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { RateLimiterService } from '../../redis/rate-limiter.service';

const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_SECONDS = 15 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const user = await this.createAccount(dto, 'CUSTOMER');
    return this.startSession(user);
  }

  createAgent(dto: CreateAgentDto): Promise<User> {
    return this.createAccount(dto, 'AGENT');
  }

  private async createAccount(dto: CreateAgentDto, role: UserRole): Promise<User> {
    const passwordHash = await this.passwordService.hash(dto.password);
    return this.usersService.create({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
      role,
    });
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const limitKey = `rl:login:${dto.email.trim().toLowerCase()}`;
    const limit = await this.rateLimiter.consume(limitKey, LOGIN_LIMIT, LOGIN_WINDOW_SECONDS);
    if (!limit.allowed) {
      throw new DomainException(AUTH_ERRORS.AUTH_TOO_MANY_ATTEMPTS);
    }
    const credentials = await this.usersService.findCredentialsByEmail(dto.email);
    const isValid = await this.passwordService.verify(
      dto.password,
      credentials?.passwordHash ?? null,
    );
    if (!credentials || !isValid) {
      throw new DomainException(AUTH_ERRORS.AUTH_INVALID_CREDENTIALS);
    }
    this.assertNotBanned(credentials.user);
    await this.rateLimiter.reset(limitKey);
    return this.startSession(credentials.user);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const { userId, pair } = await this.tokenService.rotate(refreshToken);
    const user = await this.usersService.getById(userId);
    this.assertNotBanned(user);
    return { ...pair, user: UserResponseDto.from(user) };
  }

  logout(refreshToken: string): Promise<void> {
    return this.tokenService.revokeSession(refreshToken);
  }

  private async startSession(user: User): Promise<AuthResult> {
    const pair = await this.tokenService.issueForNewSession(user.id);
    return { ...pair, user: UserResponseDto.from(user) };
  }

  private assertNotBanned(user: User): void {
    if (user.status === 'BANNED') {
      throw new DomainException(AUTH_ERRORS.AUTH_ACCOUNT_BANNED);
    }
  }
}
