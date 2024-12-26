import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { RabbitModule } from './services/rabbit/rabbit.module';

@Module({
  imports: [RabbitModule],
  controllers: [MessageController],
  providers: [MessageService]
})
export class MessageModule {}
