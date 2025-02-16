import { Controller } from '@nestjs/common';
import { EventPattern, Ctx, RmqContext, Payload } from '@nestjs/microservices';
import { ChatConsumerService } from './chat-consumer.service';
import { Chat } from 'src/types/chat';

@Controller('chat-consumer')
export class ChatConsumerController {
  constructor(private readonly chatConsumerService: ChatConsumerService) {}
  @EventPattern()
  handleMessage(@Payload() data: Chat, @Ctx() context: RmqContext) {
    this.chatConsumerService.handleMessage(data, context);
  }
}
