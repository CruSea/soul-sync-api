import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { ClientService } from './strategy/client.service';

@Injectable()
export class ChatConsumerService {
  constructor(private readonly client: ClientService) {}

  async handleMessage(data: MessagePayload, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const strategy = await this.client.resolve(data.metadata.channelId);
      await strategy.send(data);
      channel.ack(originalMsg);
    } catch (error) {
      console.log('Error handling message', error);
      channel.nack(originalMsg);
    }
  }
}
