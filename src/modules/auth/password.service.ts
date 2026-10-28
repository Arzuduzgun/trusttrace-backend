// Şifre hash'leme. bcrypt bilerek yavaş: saldırgan saniyede milyonlarca şifre deneyemez.
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const BCRYPT_COST = 12;

@Injectable()
export class PasswordService {
  // Kullanıcı bulunamasa da bununla karşılaştırırız: cevap süresi aynı kalır.
  private readonly dummyHash = bcrypt.hashSync('timing-safe-dummy-password', BCRYPT_COST);

  hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, BCRYPT_COST);
  }

  // Hash yoksa (kullanıcı bulunamadıysa) sahte hash'le karşılaştırır, sonuç her zaman false olur.
  async verify(plainPassword: string, passwordHash: string | null): Promise<boolean> {
    const matches = await bcrypt.compare(plainPassword, passwordHash ?? this.dummyHash);
    return passwordHash !== null && matches;
  }
}
