import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { Strategy } from '../strategy/strategy';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class DatabaseConsumerService {
  private strategy: Strategy;
  async handleMessage(data: MessagePayload, context: RmqContext) { }
  async setStrategy(strategy: Strategy) { }
  async saveToDatabase(data: CreateMessageDto) { }
}

// console.log(data);
// console.log(context);
// const channel = context.getChannelRef();
// const originalMsg = context.getMessage();
// channel.ack(originalMsg);
