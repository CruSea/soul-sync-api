import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TelegramModule } from '../channel/telegram/telegram.module';
import { RabbitModule } from '../channel/rabbit/rabbit.module';

@Module({
  imports: [TelegramModule, RabbitModule],
  controllers: [MessageController],
  providers: [MessageService]
})
export class MessageModule {}
