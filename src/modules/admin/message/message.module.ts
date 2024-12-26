import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { RabbitModule } from './rabbit/rabbit.module';
import { TelegramModule } from '../channel/telegram/telegram.module';

@Module({
  imports: [RabbitModule, TelegramModule],
  controllers: [MessageController],
  providers: [MessageService]
})
export class MessageModule {}
