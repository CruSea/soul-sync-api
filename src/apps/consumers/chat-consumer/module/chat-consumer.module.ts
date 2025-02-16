import { Module } from '@nestjs/common';
import { ChatConsumerController } from './chat-consumer.controller';
import { ChatConsumerService } from './chat-consumer.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TelegramConcreteStrategyService } from '../concrete-strategies/telegram-concrete-strategy.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [ChatConsumerController],
  providers: [
    ChatConsumerService,
    {
      provide: 'chat-consumer-concrete-strategies',
      useFactory: () => [new TelegramConcreteStrategyService(new PrismaService())],
    },
  ],
})
export class ChatConsumerModule {}
