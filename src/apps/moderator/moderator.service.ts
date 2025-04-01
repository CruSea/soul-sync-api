import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class ModeratorService {
  async handleMessage(message: any, context: RmqContext) {
    console.log({ message: message, context: context });
  }
}
