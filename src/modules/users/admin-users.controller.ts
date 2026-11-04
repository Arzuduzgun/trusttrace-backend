import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserQueryDto } from './dto/user-query.dto';
import { UsersService } from './users.service';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';

@ApiTags('Admin – Users')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiEnvelope(AdminUserResponseDto, { isArray: true })
  async list(@Query() query: UserQueryDto): Promise<AdminUserResponseDto[]> {
    const users = await this.usersService.listForAdmin(query);
    return users.map((user) => AdminUserResponseDto.fromAdmin(user));
  }
}
