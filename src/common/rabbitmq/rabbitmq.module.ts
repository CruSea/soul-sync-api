import { forwardRef, Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { MessageExchangeService } from './message-exchange/message-exchange.service';
import { ChatExchangeService } from './chat-exchange/chat-exchange.service';
import { TelegramMessageValidator } from './consumers/database/message-validators/telegram-message-validator.service';
import { DatabaseConsumerService } from './consumers/database/database-consumer.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { RabbitMQConnectionService } from './consumers/rabbit-connection.service';
import { MessageConsumerService } from './consumers/message/message-consumer.service';
import { RedisModule } from '../redis/redis.module';
import { ChatModule } from 'src/modules/chat/chat.module';
import { ChatConsumerService } from './consumers/chat/chat-consumer.service';
import { TelegramChatValidator } from './consumers/chat/chat-out-let-implementations/telegram-chat.service';

@Module({
  imports: [PrismaModule, RedisModule, forwardRef(() => ChatModule)],
  providers: [
    RabbitmqService,
    MessageExchangeService,
    ChatExchangeService,
    DatabaseConsumerService,
    RabbitMQConnectionService,
    MessageConsumerService,
    ChatConsumerService,
    {
      provide: 'MessageValidators',
      useFactory: () => [new TelegramMessageValidator()],
    },
    {
      provide: 'MessageTransmitterValidator',
      useFactory: () => [],
    },
    {
      provide: 'SendChatInterface',
      useFactory: () => [new TelegramChatValidator()],
    },
  ],
  exports: [RabbitmqService, MessageExchangeService, ChatExchangeService],
})
export class RabbitmqModule {}
