import { Injectable } from '@nestjs/common';
import { Strategy } from './strategy';
import { TelegramConcreteStrategy } from '../concrete-strategies/telegram-concrete-strategy.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ClientService {
  private readonly strategies: Record<string, Strategy>;

  constructor(
    private readonly telegramMessageStrategy: TelegramConcreteStrategy,
    private readonly prisma: PrismaService,
  ) {
    this.strategies = {
      TELEGRAM: this.telegramMessageStrategy,
    };
  }

  async resolve(channelId: string): Promise<Strategy> {
    const type = await this.getChannelType(channelId);
    const strategy = this.strategies[type.toUpperCase()];
    if (!strategy) {
      throw new Error(`Unsupported message type: ${type}`);
    }
    return strategy;
  }

  async getChannelType(channelId: string): Promise<string> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }
    return channel.type;
  }
}
