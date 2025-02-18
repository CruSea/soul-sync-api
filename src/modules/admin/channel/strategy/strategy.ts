import { Injectable } from '@nestjs/common';
import { ChannelStrategy } from '../interface/channelStrategy.interface';
import { TelegramChannel } from '../platforms/telegram/Telegram-channel';

@Injectable()
export class StrategyResolver {
  private readonly strategies: Record<string, ChannelStrategy>;

  constructor(private readonly telegramChannel: TelegramChannel) {
    this.strategies = {
      TELEGRAM: this.telegramChannel,
    };
  }

  resolve(type: string): ChannelStrategy {
    const strategy = this.strategies[type.toUpperCase()];
    if (!strategy) {
      throw new Error(`Unsupported channel type: ${type}`);
    }
    return strategy;
  }
}
