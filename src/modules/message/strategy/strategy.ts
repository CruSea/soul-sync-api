import { Injectable } from '@nestjs/common';
import { MessageStrategy } from '../interface/message-strategy.interface';
import { TelegramMessageStrategy } from '../platform/telegram-message';

@Injectable()
export class MessageStrategyResolver {
  private readonly strategies: Record<string, MessageStrategy>;

  constructor(
    private readonly telegramMessageStrategy: TelegramMessageStrategy,
  ) {
    this.strategies = {
      TELEGRAM: this.telegramMessageStrategy,
    };
  }

  resolve(type: string): MessageStrategy {
    const strategy = this.strategies[type.toUpperCase()];
    if (!strategy) {
      throw new Error(`Unsupported message type: ${type}`);
    }
    return strategy;
  }
}
