import { Module } from '@nestjs/common';
import { MessageConsumersService } from './message-consumers.service';
import { MessageConsumersController } from './message-consumers.controller';

@Module({
  providers: [MessageConsumersService],
  controllers: [MessageConsumersController]
})
export class MessageConsumersModule {}
