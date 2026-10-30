//Cursor’ı üretir ve çözer.
import { COMMON_ERRORS } from '../errors/common.errors';
import { DomainException } from '../errors/domain.exception';

export interface CursorPosition {
  createdAt: Date;
  id: string;
}

//Bir mesajın zamanını ve id’sini alıp tek bir metne çevirir.
export function encodeCursor(position: CursorPosition): string {
  return Buffer.from(`${position.createdAt.toISOString()}|${position.id}`).toString('base64url');
}

//Metni tekrar zamana ve id’ye çevirir. Metin bozuksa INVALID_CURSOR fırlatır.
export function decodeCursor(cursor: string): CursorPosition {
  const [isoDate, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
  const createdAt = new Date(isoDate ?? '');
  if (!id || Number.isNaN(createdAt.getTime())) {
    throw new DomainException(COMMON_ERRORS.INVALID_CURSOR);
  }
  return { createdAt, id };
}
