import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageType } from '@prisma/client';

@Injectable()
export class DatabaseConsumerService {
  constructor(private readonly prisma: PrismaService) {}

  async handleMessage(data: MessagePayload, context: RmqContext) {
    if (!context.getChannelRef() || !context.getMessage()) {
      throw new Error('Channel or message is undefined');
    }
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      const message = await this.formatMessage(data);
      await this.saveToDatabase(message);
      channel.ack(originalMsg);
    } catch (error) {
      console.log('Error handling message', error);
      channel.nack(originalMsg);
    }
  }
  async formatMessage(data: any): Promise<CreateMessageDto> {
    try {
      let type: MessageType;
      const message =
        (await typeof data) === 'string' ? JSON.parse(data) : data;
      if (message.type === 'MESSAGE') {
        type = MessageType.RECEIVED;
      } else {
        type = MessageType.SENT;
      }
      return {
        channelId: message.metadata.channelId,
        address: message.metadata.address,
        type: type,
        body: message.payload,
        conversationId: message.metadata.conversationId,
      };
    } catch (error) {
      console.log('Error formatting message', error);
    }
  }
  async saveToDatabase(message: CreateMessageDto) {
    try {
      return this.prisma.$transaction(async (tx) => {
        const createdMessage = await tx.message.create({
          data: {
            type: message.type,
            body: message.body,
            channelId: message.channelId,
            address: message.address,
          },
        });

        if (!message.conversationId) {
          const mentor = await tx.mentor.findFirst({
            where: {
              Account: {
                Channel: {
                  some: {
                    id: message.channelId,
                  },
                },
              },
            },
          });
          message.conversationId = (
            await tx.conversation.create({
              data: {
                address: message.address,
                channelId: message.channelId,
                isActive: true,
                mentorId: mentor.id,
              },
            })
          ).id;
        }

        await tx.thread.create({
          data: {
            messageId: createdMessage.id,
            conversationId: message.conversationId,
          },
        });
      });
    } catch (error) {
      console.log('Error saving to database', error);
    }
  }
}
