import { Injectable } from '@nestjs/common';
import { Strategy } from '../strategy/strategy';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TelegramConcreteStrategyService implements Strategy {
  constructor(private readonly prisma: PrismaService) {}
  supportChannelType(type: string): boolean {
    return type === 'TELEGRAM';
  }
  async sendMessage(data: any) {
    const channel = await this.prisma.channel.findFirst({
      where: {
        id: data.channelId,
      },
    });
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: data.conversationId,
      },
    });
    const config = channel.configuration as { token: string };
    fetch('https://api.telegram.org/bot' + config.token + '/sendMessage'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: conversation.address,
          text: data.message,
        }),
      };
  }
}
