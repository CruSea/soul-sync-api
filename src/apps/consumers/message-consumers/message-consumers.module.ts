import { Module } from '@nestjs/common';
import { MessageConsumersService } from './message-consumers.service';
import { MessageConsumersController } from './message-consumers.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [PrismaModule, RabbitmqModule],
  providers: [MessageConsumersService],
  controllers: [MessageConsumersController],
})
export class MessageConsumersModule {}
