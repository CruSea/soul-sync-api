import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { MessageExchangeService } from './message-exchange/message-exchange.service';
import { ChatExchangeService } from './chat-exchange/chat-exchange.service';
import { MessageExchangeQueuesService } from './message-exchange/message-exchange-queues.service';

@Module({
  providers: [
    RabbitmqService,
    MessageExchangeService,
    ChatExchangeService,
    MessageExchangeQueuesService,
    ChatExchangeQueuesService
  ],
  exports: [RabbitmqService, MessageExchangeService, ChatExchangeService],
})
export class RabbitmqModule {}
