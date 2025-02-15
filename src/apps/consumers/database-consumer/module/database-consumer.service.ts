import { Inject, Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { Strategy } from '../strategy/strategy';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class DatabaseConsumerService {
  private strategy: Strategy;
  constructor(
    @Inject('database-consumer-concrete-strategy')
    private readonly concreteStrategies: Strategy[],
    private readonly prisma: PrismaService,
  ) {}
  async handleMessage(data: MessagePayload, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.setStrategy(data.metadata?.type);
      const message = await this.strategy.FormatIncomingMessage(data);
      await this.saveToDatabase(message);
      channel.ack(originalMsg);
    } catch (error) {
      console.log('error saving the new message', error);
      channel.nack(originalMsg);
    }
  }
  async setStrategy(type: string) {
    this.strategy = await this.concreteStrategies.find((strategy) =>
      strategy.SupportChannelType(type),
    );
  }
  async saveToDatabase(message: CreateMessageDto) {
    try {
      return this.prisma.$transaction(async (tx) => {
        const channel = await this.prisma.channel.findFirst({
          where: {
            id: message.channelId,
          },
        });
        const accountId = channel?.accountId;
        const mentor = await this.prisma.mentor.findFirst({
          where: { accountId },
        });
        const createdMessage = await this.prisma.message.create({
          data: message,
        });

        const existingConversation = await this.prisma.conversation.findFirst({
          where: { address: message.address, isActive: true },
        });

        const conversationId = existingConversation
          ? existingConversation.id
          : (
              await this.prisma.conversation.create({
                data: {
                  address: message.address,
                  channelId: message.channelId,
                  isActive: true,
                  mentorId: mentor.id,
                },
              })
            ).id;
        await this.prisma.thread.create({
          data: {
            messageId: createdMessage.id,
            conversationId,
          },
        });
      });
    } catch (error) {
      console.log('error in db transaction', error);
    }
  }
}
