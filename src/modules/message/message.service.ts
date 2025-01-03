import { Injectable } from '@nestjs/common';
import { NegaritMessageDto } from './dto/negarit-message.dto';
import { MessageExchangeService } from 'src/common/rabbitmq/message-exchange/message-exchange.service';
import { RabbitmqService } from 'src/common/rabbitmq/rabbitmq.service';
import { TelegramChat } from 'src/types/telegram';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageExchangeService: MessageExchangeService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  telegram(id: string, telegramChat: TelegramChat) {
    const data = this.rabbitmqService.getMessageEchangeData(id, telegramChat);
    this.messageExchangeService.send('telegram', data);
    return 'ok';
  }

  negarit(negaritMessageDto: NegaritMessageDto) {
    console.log('negaritMessageDto', negaritMessageDto);
    return `This action returns all message`;
  }
}
