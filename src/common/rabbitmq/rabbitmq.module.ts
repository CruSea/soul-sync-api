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
import { TelegramMessageValidatorService } from './consumers/message/message-validators/telegram-message.service';

@Module({
  imports: [PrismaModule, RedisModule, forwardRef(() => ChatModule)],
  providers: [
    RabbitmqService,
    MessageExchangeService,
    ChatExchangeService,
    DatabaseConsumerService,
    RabbitMQConnectionService,
    MessageConsumerService,
    {
      provide: 'MessageValidators',
      useFactory: () => [new TelegramMessageValidator()],
    },
    {
      provide: 'MessageTransmitterValidator',
      useFactory: () => [new TelegramMessageValidatorService()],
    },
  ],
  exports: [RabbitmqService, MessageExchangeService, ChatExchangeService],
})
export class RabbitmqModule {}
