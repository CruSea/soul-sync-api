import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { SentMessageDto } from './dto/sent-message.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RedisService } from 'src/common/redis/redis.service';
import { io } from 'socket.io-client';

@Injectable()
export class MessageConsumersService {

  private static token = 'message-consumer';
  private socket = io(
    `https://1clr2kph-3002.uks1.devtunnels.ms?token=${MessageConsumersService.token}`,
  );

  constructor(
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
 
    async handleMessage(data: any, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
        try {
        const sentMessageDto = await this.formatMessage(data);
      await this.sendMessage(data);
      channel.ack(originalMsg);
    } catch (error) {
      channel.nack(originalMsg);
      console.log('Error in handleMessage:', error);
    }
    }
    
    async formatMessage(data:any): Promise<SentMessageDto> {
        try {
            return {
              conversationId: data.metadata.conversationId,
              type: 'RECEIVED',
              body: data.payload,
              createdAt: new Date().toISOString(),
              email: await this.getMentorEmail(data.metadata.conversationId),
            };
        } catch (error) {
            console.log('Error formatting message', error);
        }
    }
 
    async sendMessage(message: SentMessageDto) {
    try {
      const socketId = await this.redis.get(message.email);
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
