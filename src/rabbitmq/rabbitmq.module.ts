import { Module } from '@nestjs/common';
import { ProducerService } from 'src/modules/queue/producer/producer.service';
import { ConsumerService } from 'src/modules/queue/consumer/consumer.service';

@Module({
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService, ConsumerService],
})
export class RabbitMQModule {}
