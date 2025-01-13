import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { DatabaseConsumerService } from './message-exchange/database/databaseConsumer.service';
import { RabbitmqService } from '../rabbitmq.service';
import { RedisService } from 'src/common/redis/redis.service';
import { MentorChatService } from './chat-exchange/mentor-chat.service';
import { ChatModule } from 'src/modules/chat/chat.module';
import { ChatExchangeService } from '../chat-exchange/chat-exchange.service';

@Module({
  imports: [forwardRef(() => ChatModule)],
  providers: [
    DatabaseConsumerService,
    PrismaService,
    RabbitmqService,
    RedisService,
    MentorChatService,
    ChatExchangeService,
  ],
  exports: [DatabaseConsumerService, MentorChatService],
})
export class ConsumerModule {}
