import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class MessageExchangeQueuesService {
  private readonly QUEUE_NAMES = ['message', 'database'];
  private readonly ROUTING_KEY = 'message';
  private channel: amqp.Channel;

  async init(channel: amqp.Channel, exchangeName: string) {
    this.channel = channel;
    await this.createQueue(exchangeName);
  }
  async createQueue(exchangeName: string) {
    for (const queueName of this.QUEUE_NAMES) {
      try {
        await this.channel.assertQueue(queueName, {
          durable: true,
          messageTtl: 60000,
          deadLetterExchange: 'message',
          deadLetterRoutingKey: 'dead',
        });
        await this.channel.bindQueue(queueName, exchangeName, this.ROUTING_KEY);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
