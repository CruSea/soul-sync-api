import { Module } from '@nestjs/common';
import { MessageConsumerController } from './message-consumer.controller';
import { MessageConsumerService } from './message-consumer.service';
import { TelegramStrategyService } from '../concrete-strategies/telegram-concrete-strategy.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RedisService } from 'src/common/redis/redis.service';
import { ChatService } from 'src/modules/chat/chat.service';
import { ChatModule } from 'src/modules/chat/chat.module';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [ChatModule, RedisModule],
  controllers: [MessageConsumerController],
  providers: [
    MessageConsumerService,
    PrismaService,
    {
      provide: 'message-consumer-concrete-strategies',
      useFactory: () => [new TelegramStrategyService(new PrismaService())],
    },
  ],
})
export class MessageConsumerModule {}
