import { Injectable } from '@nestjs/common';
import { NegaritMessageDto } from './dto/negarit-message.dto';
import { MessageExchangeService } from 'src/common/rabbitmq/message-exchange/message-exchange.service';
import { RabbitmqService } from 'src/common/rabbitmq/rabbitmq.service';
import { TelegramChat } from 'src/types/telegram';
import { NegaritChat } from 'src/types/negarit';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageExchangeService: MessageExchangeService,
    private readonly rabbitmqService: RabbitmqService,
  ) { }

  async telegram(id: string, telegramChat: TelegramChat) {
    const data = await this.rabbitmqService.getMessageEchangeData(id, telegramChat);
    console.log('data:', data);
    // this.messageExchangeService.send('message', data);
    return 'ok';
  }

  async negarit(id: string, negaritChat: NegaritChat) {
    const data = await this.rabbitmqService.getMessageEchangeData(id, negaritChat);
    await this.messageExchangeService.send('message', data);
    return 'ok';
  }
}
