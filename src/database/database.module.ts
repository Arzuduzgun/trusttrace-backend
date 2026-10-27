import { Global, Module } from '@nestjs/common';
import { databaseProvider } from './database.provider';
import { DRIZZLE } from './database.tokens';

@Global()
@Module({
  providers: [databaseProvider],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
