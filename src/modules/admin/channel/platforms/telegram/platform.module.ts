import { Module } from '@nestjs/common';
import { TelegramChannel } from './Telegram-channel';

@Module({
  providers: [TelegramChannel],
  exports: [TelegramChannel],
})
export class PlatformModule {}
