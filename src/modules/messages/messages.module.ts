import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ProducerService } from '../queue/producer/producer.service'; // Import the ProducerService
import { ConsumerService } from '../queue/consumer/consumer.service';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, ProducerService, ConsumerService], // Register ProducerService here
})
export class MessagesModule {}
