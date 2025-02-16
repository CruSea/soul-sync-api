import { Module } from '@nestjs/common';
import { MessageConsumerController } from './message-consumer.controller';
import { MessageConsumerService } from './message-consumer.service';

@Module({
  controllers: [MessageConsumerController],
  providers: [MessageConsumerService,
    {
      provide: 'message-consumer-concrete-strategies',
      useFactory: () => []
    }
  ]
})
export class MessageConsumerModule {}
