import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class MessageExchangeQueuesService {
  private readonly QUEUE_NAMES = ['message', 'database'];
  private readonly PRE_CONV_QUEUE_NAMES = ['moderator', 'database'];
  private channel: amqp.Channel;

  async init(channel: amqp.Channel, exchangeName: string) {
    this.channel = channel;
    await this.createQueue(exchangeName, this.QUEUE_NAMES, 'message');
    await this.createQueue(
      exchangeName,
      this.PRE_CONV_QUEUE_NAMES,
      'moderator',
    );
  }

  async createQueue(
    exchangeName: string,
    queueNames: string[],
    routingKey: string,
  ) {
    for (const queueName of queueNames) {
      try {
        await this.channel.assertQueue(queueName, {
          durable: true,
          messageTtl: 60000,
          deadLetterExchange: 'message',
          deadLetterRoutingKey: 'dead',
        });
        await this.channel.bindQueue(queueName, exchangeName, routingKey);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
