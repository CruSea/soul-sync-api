import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MessageStrategyResolver } from './strategy/strategy';

@Injectable()
export class MessageService {
  constructor(
    private readonly strategyResolver: MessageStrategyResolver,
    private readonly prisma: PrismaService,
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
