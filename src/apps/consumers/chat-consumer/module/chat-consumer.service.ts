import { Injectable, NotFoundException } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Chat } from 'src/types/chat';
import { Strategy } from '../strategy/strategy';

@Injectable()
export class ChatConsumerService {
  private strategy: Strategy;
  async handleMessage(data: Chat, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      await this.setStrategy();
      if (!this.strategy) {
        throw new NotFoundException('No strategy found');
      }
      await this.strategy.sendMessage(data);
      channel.ack(originalMessage);
    } catch (error) {
      console.log(error);
      channel.nack(originalMessage);
    }
  }
  async setStrategy() {}
}
