import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';

@Injectable()
export class MessageConsumerService {
  async handleMessage(data: MessagePayload, context: RmqContext) {}
}
