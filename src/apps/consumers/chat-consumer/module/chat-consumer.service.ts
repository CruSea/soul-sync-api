import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Chat } from 'src/types/chat';

@Injectable()
export class ChatConsumerService {
  handleMessage(data: Chat, context: RmqContext) {}
}
