import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';
import { MessageStrategyResolver } from './strategy/strategy';
import { PlatformModule } from './platform/platform.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [RabbitmqModule, PlatformModule, PrismaModule],
  controllers: [MessageController],
  providers: [MessageService, MessageStrategyResolver],
  exports: [MessageService],
})
export class MessageModule {}
