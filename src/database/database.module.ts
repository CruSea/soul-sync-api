import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global() //To import it once and not every other time
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DatabaseModule {}
