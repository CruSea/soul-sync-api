import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ChatExchangeQueuesService } from './chat-exchange-queues.service';

@Injectable()
export class ChatExchangeService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly EXCHANGE_NAME = 'chat';
  private readonly EXCHANGE_TYPE = 'topic'; // (direct, fanout, topic)

  constructor(
    private readonly chatExchangeQueuesService: ChatExchangeQueuesService,
  ) {}

  async onModuleInit() {
    await this.connect();
  }
  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    this.connection = await amqp.connect(this.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.EXCHANGE_NAME, this.EXCHANGE_TYPE, {
      durable: true,
    });
    console.log('ChatExchangeService Connected!');
    await this.chatExchangeQueuesService.init(this.channel, this.EXCHANGE_NAME);
  }

  private async disconnect() {
    await this.channel.close();
    await this.connection.close();
    console.log('ChatExchangeService Disconnected!');
  }

  async send(routingKey: string, message: any) {
    const messageBuffer = Buffer.from(JSON.stringify(message));
    if (this.channel) {
      this.channel.publish(this.EXCHANGE_NAME, routingKey, messageBuffer, {
        persistent: true,
      });
      console.log('Message Sent');
    }
  }
}
