import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';

@Injectable()
export class DatabaseConsumerService {
  async handleMessage(data: MessagePayload, context: RmqContext) {
    console.log(data);
    console.log(context);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
