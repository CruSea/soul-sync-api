import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { RabbitModule } from '../../message/rabbit/rabbit.module';

@Module({
  imports: [RabbitModule],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService]
})
export class TelegramModule {}
