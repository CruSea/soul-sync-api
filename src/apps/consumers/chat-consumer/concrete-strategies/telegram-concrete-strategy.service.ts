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
    try {
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: data.metadata.conversationId,
        },
      });
      const channel = await this.prisma.channel.findFirst({
        where: {
          id: conversation.channelId,
        },
      });

      const config = channel.configuration as { token: string };
      console.log('config: ', config);
      console.log('data: ', data);

      const response = await fetch(
        'https://api.telegram.org/bot' + config.token + '/sendMessage',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: conversation.address,
            text: data.payload,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Error sending message to Telegram: ${response.status} ${response.statusText}`,
        );
      }

      console.log('Message sent to Telegram successfully');
    } catch (error) {
      console.log('error in sending message to telegram: ', error);
    }
  }
}
