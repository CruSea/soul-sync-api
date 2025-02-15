import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { MessageExchangeQueuesService } from './message-exchange-queues.service';

@Injectable()
export class MessageExchangeService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly EXCHANGE_NAME = 'message';
  private readonly EXCHANGE_TYPE = 'topic'; // (direct, fanout, topic)

  constructor(
    private readonly messageExchangeQueuesService: MessageExchangeQueuesService,
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
    console.log('MessageExchangeService Connected!');
  }

  private async disconnect() {
    await this.channel.close();
    await this.connection.close();
    console.log('MessageExchangeService Disconnected!');
    await this.messageExchangeQueuesService.init(
      this.channel,
      this.EXCHANGE_NAME,
    );
  }

  async send(routingKey: string, message: any) {
    const messageBuffer = Buffer.from(JSON.stringify(message));
    this.channel.publish(this.EXCHANGE_NAME, routingKey, messageBuffer, {
      persistent: true,
    });
    console.log(
      `Message sent to exchange "${this.EXCHANGE_NAME}" with routing key "${routingKey}":`,
      message,
    );
  }
}
