import { Module } from '@nestjs/common';
import { TelegramMessageStrategy } from './telegram-message';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  providers: [TelegramMessageStrategy],
  exports: [TelegramMessageStrategy],
})
export class PlatformModule {}
