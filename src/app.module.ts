import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [DatabaseModule, MessageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
