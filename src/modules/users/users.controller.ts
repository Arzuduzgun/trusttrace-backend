//GET /api/v1/me adresiyle “ben kimim?” sorusunu cevaplar. Giriş yapan kullanıcının bilgisini döner.
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import type { User } from './users.types';

@Controller('me')
export class UsersController {
  @Get()
  me(@CurrentUser() user: User): UserResponseDto {
    return UserResponseDto.from(user);
  }
}
