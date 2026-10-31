//GET /admin/users adresini açar. Admin kullanıcıları durumlarına göre listeleyebilir
import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Roles('ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(@Query() query: UserQueryDto): Promise<UserResponseDto[]> {
    const users = await this.usersService.list(query);
    return users.map((user) => UserResponseDto.from(user));
  }
}
