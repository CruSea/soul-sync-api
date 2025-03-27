import { Injectable } from '@nestjs/common';
import { Strategy } from '../strategy/strategy';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TelegramConcreteStrategy implements Strategy {
  constructor(private prisma: PrismaService) {}
  async send(data: any) {
    try {
      const channel = await this.prisma.channel.findFirst({
        where: {
          id: data.metadata.channelId,
        },
      });

      const config = channel.configuration as { token: string };
      const response = await fetch(
        'https://api.telegram.org/bot' + config.token + '/sendMessage',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: data.metadata.address,
            text: data.payload,
          }),
        },
      );

      console.log('data', data);
      console.log('response', response);
      console.log('config', config);

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
