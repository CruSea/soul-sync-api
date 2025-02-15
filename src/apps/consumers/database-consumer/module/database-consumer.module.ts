import { Module } from '@nestjs/common';
import { DatabaseConsumerController } from './database-consumer.controller';
import { DatabaseConsumerService } from './database-consumer.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TelegramStrategyService } from '../concrete-strategies/telegram-strategy.service';

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
    DatabaseConsumerService,
    {
      provide: 'database-consumer-concrete-strategy',
      useFactory: () => {
        new TelegramStrategyService();
      },
    },
  ],
})
export class DatabaseConsumerModule {}
