import { Module } from '@nestjs/common';
import { TelegramMessageStrategy } from './telegram-message';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  imports: [RabbitmqModule],
  providers: [TelegramMessageStrategy, PrismaService],
  exports: [TelegramMessageStrategy],
})
export class PlatformModule {}
