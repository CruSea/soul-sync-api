import { Module } from '@nestjs/common';
import { DatabaseConsumerController } from './database-consumer.controller';
import { DatabaseConsumerService } from './database-consumer.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TelegramStrategyService } from '../concrete-strategies/telegram-strategy.service';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { ChatStrategyService } from '../concrete-strategies/chat-strategy.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [DatabaseConsumerController],
  providers: [
    PrismaService,
    DatabaseConsumerService,
    {
      provide: 'database-consumer-concrete-strategies',

      useFactory: () => [
        new TelegramStrategyService(),
        new ChatStrategyService(new PrismaService()),
      ],
    },
  ],
})
export class DatabaseConsumerModule {}
