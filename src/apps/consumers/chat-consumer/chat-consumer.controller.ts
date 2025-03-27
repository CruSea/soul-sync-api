import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { ChatConsumerService } from './chat-consumer.service';

@Controller('chat-consumer')
export class ChatConsumerController {
  constructor(private readonly chatService: ChatConsumerService) {}
  @EventPattern()
  async handleMessage(
    @Payload() data: MessagePayload,
    @Ctx() context: RmqContext,
  ) {
    this.chatService.handleMessage(data, context);
  }
}
