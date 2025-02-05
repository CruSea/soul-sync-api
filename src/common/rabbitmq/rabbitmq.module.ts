import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { MessageExchangeService } from './message-exchange/message-exchange.service';
import { ChatExchangeService } from './chat-exchange/chat-exchange.service';
import { TelegramMessageValidator } from './consumers/database/message-validators/telegram-message-validator.service';
import { DatabaseConsumerService } from './consumers/database/database-consumer.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { RabbitMQConnectionService } from './consumers/rabbit-connection.service';
import { ChatMessageValidator } from './consumers/database/message-validators/chat-validator.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [
    RabbitmqService,
    MessageExchangeService,
    ChatExchangeService,
    DatabaseConsumerService,
    RabbitMQConnectionService,
    {
      provide: 'MessageValidators',
      useFactory: () => [
        new TelegramMessageValidator(),
        new ChatMessageValidator(new PrismaService()),
      ],
    },
  ],
  exports: [RabbitmqService, MessageExchangeService, ChatExchangeService],
})
export class RabbitmqModule {}
