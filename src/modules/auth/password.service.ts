import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const BCRYPT_COST = 12;

@Injectable()
export class PasswordService {
  private readonly dummyHash = bcrypt.hashSync('timing-safe-dummy-password', BCRYPT_COST);

  hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, BCRYPT_COST);
  }

  async verify(plainPassword: string, passwordHash: string | null): Promise<boolean> {
    const matches = await bcrypt.compare(plainPassword, passwordHash ?? this.dummyHash);
    return passwordHash !== null && matches;
  }
}
