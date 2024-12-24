import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TelegramModule } from '../channel/telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  controllers: [MessageController],
  providers: [MessageService]
})
export class MessageModule {}
