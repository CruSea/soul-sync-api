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

  telegram(id: string, telegramChat: TelegramChat) {
    const data = this.rabbitmqService.getMessageEchangeData(id, telegramChat);
    this.messageExchangeService.send('telegram', data);
    return 'ok';
  }

  negarit(id: string, negaritChat: NegaritChat) {
    const data = this.rabbitmqService.getMessageEchangeDataNegarit(id, negaritChat);
    this.messageExchangeService.send('negarit', data);
    //console.log('negaritMessageDto', negaritMessageDto);
    return 'ok';
  }

  processNegaritWebhook(id: string, received_message: any) {
    const data = this.rabbitmqService.getMessageEchangeDataNegarit(id, received_message);
    this.messageExchangeService.send('negarit', data);
    console.log('Negarit response data:', data);
    return 'ok';
  }


}
