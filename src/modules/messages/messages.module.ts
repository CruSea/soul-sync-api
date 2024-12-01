import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ProducerService } from '../queue/producer.service'; // Import the ProducerService

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, ProducerService], // Register ProducerService here
})
export class MessagesModule {}
