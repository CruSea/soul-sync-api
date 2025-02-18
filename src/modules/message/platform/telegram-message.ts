import { Injectable } from '@nestjs/common';
import { RabbitmqService } from 'src/common/rabbitmq/rabbitmq.service';
import { TelegramChat } from 'src/types/telegram';
import { MessageStrategy } from '../interface/message-strategy.interface';
import { MessageExchangeService } from 'src/common/rabbitmq/message-exchange/message-exchange.service';
@Injectable()
export class TelegramMessageStrategy implements MessageStrategy {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly messageExchangeService: MessageExchangeService,
  ) {}

  async processMessage(id: string, message: TelegramChat): Promise<string> {
    const data = await this.rabbitmqService.getMessageEchangeData(id, message);
    console.log('Processed Telegram message:', data);
    this.messageExchangeService.send('telegram', data);

    return 'ok';
  }
}
