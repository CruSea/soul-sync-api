import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { MessagesModule } from './modules/messages/messages.module';

@Module({
  imports: [DatabaseModule, MessagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
