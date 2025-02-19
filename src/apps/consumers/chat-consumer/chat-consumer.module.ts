import { Module } from '@nestjs/common';
import { ChatConsumerController } from './chat-consumer.controller';
import { ChatConsumerService } from './chat-consumer.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { ClientService } from './strategy/client.service';
import { TelegramConcreteStrategy } from './concrete-strategies/telegram-concrete-strategy.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [ChatConsumerController],
  providers: [ChatConsumerService, ClientService, TelegramConcreteStrategy],
})
export class ChatConsumerModule {}
