import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { RedisService } from 'src/common/redis/redis.service';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [forwardRef(() => RabbitmqModule), JwtModule, RedisModule],
  providers: [ChatGateway, ChatService, RedisService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
