import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { RedisModule } from 'src/common/redis/redis.module';
import { SocketService } from './socket.service';

@Module({
  imports: [RabbitmqModule, JwtModule, RedisModule],
  providers: [ChatGateway, ChatService, SocketService],
  exports: [ChatService],
})
export class ChatModule {}
