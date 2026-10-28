//Postgres’in “bu değer zaten var” hatasını tanır. Bu hatanın kodu 23505. Kullanıcı 500 değil, anlamlı bir 409 görmeli.
import { DatabaseError } from 'pg';

const PG_UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(error: unknown): boolean {
  const pgError =
    error instanceof Error && error.cause instanceof DatabaseError ? error.cause : error;
  return pgError instanceof DatabaseError && pgError.code === PG_UNIQUE_VIOLATION;
}
