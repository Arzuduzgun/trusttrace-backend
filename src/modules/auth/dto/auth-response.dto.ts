import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  accessToken!: string;
  accessTokenExpiresIn!: number;
  refreshToken!: string;
  user!: UserResponseDto;
}
