import { Injectable } from '@nestjs/common';
import { RabbitmqService } from 'src/common/rabbitmq/rabbitmq.service';
import { TelegramChat } from 'src/types/telegram';
import { MessageStrategy } from '../interface/message-strategy.interface';
import { MessageExchangeService } from 'src/common/rabbitmq/message-exchange/message-exchange.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
@Injectable()
export class TelegramMessageStrategy implements MessageStrategy {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly messageExchangeService: MessageExchangeService,
    private readonly prisma: PrismaService,
  ) {}

  async processMessage(id: string, message: TelegramChat): Promise<string> {
    const formattedMessage = await this.formatMessage(id, message);
    const data = JSON.stringify(
      await this.rabbitmqService.getMessageEchangeData(formattedMessage),
    );
    this.messageExchangeService.send('message', data);

    return 'ok';
  }

  async formatMessage(channelId: string, message: TelegramChat): Promise<any> {
    const address = String(message.message.chat.id);
    const body = message.message.text;
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        channelId,
        address: address,
      },
    });
    const conversationId = conversation?.id;
    return { channelId, address, body, conversationId };
  }
}
