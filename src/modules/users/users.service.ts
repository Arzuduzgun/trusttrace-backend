//Diğer modüllerin kullanıcıya ulaştığı tek kapı.
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../common/errors/domain.exception';
import { USER_ERRORS } from './users.errors';
import { UsersRepository } from './users.repository';
import type { NewUser, User, UserCredentials } from './users.types';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  //Kullanıcı yoksa null döner. Guard bunu kullanacak.
  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async getById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new DomainException(USER_ERRORS.USER_NOT_FOUND);
    }
    return user;
  }

  findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    return this.usersRepository.findCredentialsByEmail(normalizeEmail(email));
  }

  create(input: NewUser): Promise<User> {
    return this.usersRepository.create({ ...input, email: normalizeEmail(input.email) });
  }
}
