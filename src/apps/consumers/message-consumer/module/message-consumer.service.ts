import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { Strategy } from '../strategy/strategy';
import { ChatService } from '../../../../modules/chat/chat.service';
import { SentMessageDto } from './dto/sent-message.dto';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { RedisService } from '../../../../common/redis/redis.service';

@Injectable()
export class MessageConsumerService implements OnModuleInit {
  private strategy: Strategy;

  constructor(
    @Inject('message-consumer-concrete-strategies')
    private concreteStrategies: Strategy[],
    private chatService: ChatService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async onModuleInit() {
    console.log('concrete strategies: ', this.concreteStrategies)
  }
  async handleMessage(data: MessagePayload, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.setStrategy(data.metadata.type);
      if (!this.strategy) {
        throw new Error('Strategy not found');
      }
      const message = await this.strategy.formatIncomingMessage(data);
      await this.sendMessage(message);
      channel.ack(originalMsg);
      return;
    } catch (error) {
      channel.nack(originalMsg);
      console.log('error in handle message-consumer', error);
      return;
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

  async sendMessage(message: SentMessageDto) {
    try {
      const email = await this.getMentorEmail(message.conversationId);
      console.log('mentor email: ', email);
      const socketId = await this.redis.get(email);
      console.log('socketId: ', socketId);
      console.log('message: ', message);
      if (!socketId) {
        throw new Error('socket not connected!');
      }
      await this.chatService.send(socketId, message);
    } catch (error) {
      console.log('Error sending message', error);
    }
  }

  async getMentorEmail(conversationId: string): Promise<string> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        isActive: true,
      },
    });
    const mentor = await this.prisma.mentor.findFirst({
      where: {
        id: conversation.mentorId,
      },
    });
    return mentor.email;
  }
}
