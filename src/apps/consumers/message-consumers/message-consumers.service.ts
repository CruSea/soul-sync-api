import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { SentMessageDto } from './dto/sent-message.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { io } from 'socket.io-client';

@Injectable()
export class MessageConsumersService {
  private static token = 'message-consumer';
  private socket = io(
    `https://1clr2kph-3002.uks1.devtunnels.ms?token=${MessageConsumersService.token}`,
  );

  constructor(private prisma: PrismaService) {
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
      console.log('this is the data: ', data);
      const sentMessageDto = await this.formatMessage(data);
      console.log('this is sentMessageDto: ', sentMessageDto);
      await this.sendMessage(sentMessageDto);
      channel.ack(originalMsg);
    } catch (error) {
      channel.nack(originalMsg);
      console.log('Error in handleMessage:', error);
    }
  }

  async formatMessage(message: any): Promise<SentMessageDto> {
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      if (!data.metadata?.conversationId) {
        data.metadata.conversationId = await this.prisma.conversation.findFirst(
          {
            where: {
              address: data.metadata?.address,
              isActive: true,
            },
          },
        );
      }
      return {
        conversationId: data.metadata?.conversationId,
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
      this.socket.emit('internal', message);
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
