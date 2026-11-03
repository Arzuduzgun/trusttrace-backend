import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Admin – Users')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiEnvelope(UserResponseDto, { isArray: true })
  async list(@Query() query: UserQueryDto): Promise<UserResponseDto[]> {
    const users = await this.usersService.list(query);
    return users.map((user) => UserResponseDto.from(user));
  }
}
