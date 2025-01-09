import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { RedisService } from 'src/common/redis/redis.service';

@Module({
  imports: [RabbitmqModule, JwtModule],
  providers: [ChatGateway, ChatService, RedisService],
})
export class ChatModule {}
