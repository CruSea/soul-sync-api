import { Injectable } from '@nestjs/common';
import { MessageStrategyResolver } from './strategy/strategy';
import { TelegramChat } from 'src/types/telegram';
import { NegaritMessageDto } from './dto/negarit-message.dto';
import { RabbitmqService } from 'src/common/rabbitmq/rabbitmq.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly strategyResolver: MessageStrategyResolver,
    private readonly rabbitmqService: RabbitmqService,
    private readonly messageExchangeService: any, // Add the correct type here
  ) {}

  async telegram(id: string, telegramChat: TelegramChat) {
    const data = await this.rabbitmqService.getMessageEchangeData(
      id,
      telegramChat,
    );
    this.messageExchangeService.send('message', data);
    return 'ok';
  }

  negarit(negaritMessageDto: NegaritMessageDto) {
    console.log('negaritMessageDto', negaritMessageDto);
    return `This action returns all message`;
  }
}
