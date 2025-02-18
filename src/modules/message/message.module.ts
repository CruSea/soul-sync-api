import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
