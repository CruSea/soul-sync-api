import { Inject, Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { Strategy } from '../strategy/strategy';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Channel, channel } from 'diagnostics_channel';

@Injectable()
export class DatabaseConsumerService {
  private strategy: Strategy;
  constructor(
    @Inject('database-consumer-concrete-strategies')
    private readonly concreteStrategies: Strategy[],
    private readonly prisma: PrismaService,
  ) {}

  async handleMessage(data: MessagePayload, context: RmqContext) {
    if (!context.getChannelRef() || !context.getMessage()) {
      throw new Error('Channel or message is undefined');
    }
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.setStrategy(data.metadata?.type);
      if (!this.strategy) {
        channel.nack(originalMsg);
        throw new Error(`No strategy found for type ${data.metadata?.type}`);
      }
      const message = await this.strategy.formatIncomingMessage(data);
      await this.saveToDatabase(message);
      channel.ack(originalMsg);
    } catch (error) {
      console.log('Error handling message', error);
      channel.nack(originalMsg);
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
//use convId conditionally
  async saveToDatabase(message: CreateMessageDto) {
    try {
      

      return this.prisma.$transaction(async (tx) => {
        const createdMessage = await tx.message.create({
          data: message,
        });

        if(!(message.conversationId) ){
        const mentor = await tx.mentor.findFirst({
          where: {
            Account: {
              Channel: {
                some: {
                  id: message.channelId
                }
              }
            }
          }
        });
          message.conversationId = (await tx.conversation.create({
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
