import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/decorators/api-envelope.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import type { User } from './users.types';

@ApiTags('Me')
@ApiBearerAuth()
@Controller('me')
export class UsersController {
  @Get()
  @ApiEnvelope(UserResponseDto)
  me(@CurrentUser() user: User): UserResponseDto {
    return UserResponseDto.from(user);
  }
}
