import { Injectable } from '@nestjs/common';
import { TelegramChannel } from './Telegram-channel.js';
import { ChannelStrategy } from './channelStrategy.interface.js';

@Injectable()
export class ChannelFactory {
  getStrategy(type: string): ChannelStrategy {
    switch (type) {
      case 'TELEGRAM':
        return new TelegramChannel();
      default:
        throw new Error(`Unsupported channel type: ${type}`);
    }
  }
}
