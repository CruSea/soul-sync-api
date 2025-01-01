import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';
import { JwtModule } from '@nestjs/jwt';

@Module({ imports: [RabbitmqModule, JwtModule], providers: [ChatGateway] })
export class ChatModule {}
