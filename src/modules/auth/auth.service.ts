// Auth akışlarını yönetir: SQL yazmaz, token üretmez; doğru servisleri doğru sırada çağırır.
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import type { User } from '../users/users.types';
import { AUTH_ERRORS } from './auth.errors';
import type { AuthResult } from './auth.types';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  /** Yeni müşteri kaydı. Rol her zaman CUSTOMER: temsilci ve admin seed ya da admin ile açılır. */
  async register(dto: RegisterDto): Promise<AuthResult> {
    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
      role: 'CUSTOMER',
    });
    return this.startSession(user);
  }

  /** E-posta da şifre de yanlış olsa aynı hata, aynı süre: hangi e-postanın kayıtlı olduğu sızmaz. */
  async login(dto: LoginDto): Promise<AuthResult> {
    const credentials = await this.usersService.findCredentialsByEmail(dto.email);
    const isValid = await this.passwordService.verify(
      dto.password,
      credentials?.passwordHash ?? null,
    );
    if (!credentials || !isValid) {
      throw new DomainException(AUTH_ERRORS.AUTH_INVALID_CREDENTIALS);
    }
    this.assertNotBanned(credentials.user);
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

  // Banlı kullanıcı giremez. Askıdaki girebilir ama mesaj gönderemez (PDF kuralı).
  private assertNotBanned(user: User): void {
    if (user.status === 'BANNED') {
      throw new DomainException(AUTH_ERRORS.AUTH_ACCOUNT_BANNED);
    }
  }
}
