import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Chat } from 'src/types/chat';
import { Strategy } from '../strategy/strategy';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ChatConsumerService {
  private strategy: Strategy;

  constructor(
    @Inject('chat-consumer-concrete-strategies')
    private readonly concreteStrategies: Strategy[],
    private readonly prisma: PrismaService,
  ) {}

  async handleMessage(data: Chat, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    console.log(data);
    try {
      const type = await this.fetchChannelType(data.metadata.conversationId);
      await this.setStrategy(type);
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
  async setStrategy(type: string) {
    try {
      this.strategy = await this.concreteStrategies.find(
        (strategy) => strategy.supportChannelType(type) === true,
      );
    } catch (error) {
      console.log('Error setting strategy', error);
    }
  }

  async fetchChannelType(conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
      },
    });
    const channel = await this.prisma.channel.findFirst({
      where: {
        id: conversation.channelId,
      },
    });
    return channel.type;
  }
}
