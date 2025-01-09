import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { MessageExchangeService } from './message-exchange/message-exchange.service';
import { ChatExchangeService } from './chat-exchange/chat-exchange.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { ConsumerModule } from './consumers/consumer.module';

@Module({
  imports: [PrismaModule, ConsumerModule],
  providers: [RabbitmqService, MessageExchangeService, ChatExchangeService],
  exports: [RabbitmqService, MessageExchangeService, ChatExchangeService],
})
export class RabbitmqModule {}
