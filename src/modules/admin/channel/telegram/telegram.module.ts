import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { RabbitModule } from '../../message/rabbit/rabbit.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  imports: [RabbitModule, PrismaModule],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService]
})
export class TelegramModule {}
