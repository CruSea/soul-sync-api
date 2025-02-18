import { Inject, Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { Strategy } from '../strategy/strategy';
import { ChatService } from '../../../../modules/chat/chat.service';
import { SentMessageDto } from './dto/sent-message.dto';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { RedisService } from '../../../../common/redis/redis.service';
import { io } from 'socket.io-client';

@Injectable()
export class MessageConsumerService {
  private strategy: Strategy;
  private static token = 'message-consumer';
  private socket = io(
    `https://1clr2kph-3002.uks1.devtunnels.ms?token=${MessageConsumerService.token}`,
  );

  constructor(
    @Inject('message-consumer-concrete-strategies')
    private concreteStrategies: Strategy[],
    private chatService: ChatService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    this.socket.on('connect', () => {
      console.log('Connected to the WebSocket server');
    });
    this.socket.on('error', (error) => {
      console.error('Error occurred:', error);
    });
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
    } catch (error) {
      channel.nack(originalMsg);
      console.log('Error in handleMessage:', error);
    }
  }

  async setStrategy(type: string) {
    try {
      this.strategy =
        this.concreteStrategies.find((strategy) =>
          strategy.supportChannelType(type),
        ) ?? null;
    } catch (error) {
      console.log('Error setting strategy:', error);
    }
  }

  async sendMessage(message: SentMessageDto) {
    try {
      const email = await this.getMentorEmail(message.conversationId);
      const socketId = await this.redis.get(email);
      console.log('socketId:', socketId);
      if (!socketId) {
        throw new Error('Socket not connected!');
      }
      const chatData = {
        message,
        socketId,
      };
      this.socket.emit('internal', chatData);
    } catch (error) {
      console.log('Error sending message:', error);
    }
  }


  async getMentorEmail(conversationId: string): Promise<string> {
    try {
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: conversationId,
          isActive: true,
        },
      });
      if (!conversation) throw new Error('Conversation not found');

      const mentor = await this.prisma.mentor.findFirst({
        where: {
          id: conversation.mentorId,
        },
      });
      if (!mentor) throw new Error('Mentor not found');

      return mentor.email;
    } catch (error) {
      console.log('Error fetching mentor email:', error);
      throw error;
    }
  }
}
