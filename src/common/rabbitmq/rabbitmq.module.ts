import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { MessageExchangeService } from './message-exchange/message-exchange.service';
import { ChatExchangeService } from './chat-exchange/chat-exchange.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  providers: [
    RabbitmqService,
    MessageExchangeService,
    ChatExchangeService,
    PrismaService,
  ],
  exports: [RabbitmqService, MessageExchangeService, ChatExchangeService],
})
export class RabbitmqModule {}
