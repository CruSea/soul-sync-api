import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class ModeratorService {
  async handleMessage(message: any, context: RmqContext) {
    const channel = context.getChannelRef();
    const orgMsg = context.getMessage();
    try {
      console.log({ message: message, context: context });
      channel.ack(orgMsg);
    } catch (error) {
      console.log(error.message);
      channel.nack(orgMsg);
    }
  }
}
