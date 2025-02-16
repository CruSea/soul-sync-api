import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { MessageConsumerService } from './message-consumer.service';

@Controller('message-consumer')
export class MessageConsumerController {
    constructor(
        private readonly messageConsumerService: MessageConsumerService
    ) { }
  @EventPattern()
  async handleMessage(@Payload() data: MessagePayload, @Ctx() context: RmqContext) {
      this.messageConsumerService.handleMessage(data, context);
  }
}
