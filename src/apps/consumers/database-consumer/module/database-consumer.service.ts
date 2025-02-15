import { Inject, Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { Strategy } from '../strategy/strategy';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class DatabaseConsumerService {
  private strategy: Strategy;
  constructor(
    @Inject('database-consumer-concrete-strategy')
    private readonly concreteStrategies: Strategy[],
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
  async saveToDatabase(data: CreateMessageDto) {}
}

// console.log(data);
// console.log(context);
// const channel = context.getChannelRef();
// const originalMsg = context.getMessage();
// channel.ack(originalMsg);
