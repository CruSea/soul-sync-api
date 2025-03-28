import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { MessageExchangeService } from './message-exchange/message-exchange.service';
import { ChatExchangeService } from './chat-exchange/chat-exchange.service';
import { MessageExchangeQueuesService } from './message-exchange/message-exchange-queues.service';
import { ChatExchangeQueuesService } from './chat-exchange/chat-exchange-queues.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  providers: [
    RabbitmqService,
    MessageExchangeService,
    ChatExchangeService,
    MessageExchangeQueuesService,
    ChatExchangeQueuesService,
    PrismaService,
  ],
  exports: [RabbitmqService, MessageExchangeService, ChatExchangeService],
})
export class RabbitmqModule {}
